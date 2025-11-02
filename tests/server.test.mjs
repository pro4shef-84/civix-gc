import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sampleDataPath = join(__dirname, "..", "data", "sample-data.json");

let server;
let baseUrl;
let tempDataPath;

before(async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "civix-gc-test-"));
  tempDataPath = join(tempDir, "sample-data.json");
  const sample = await readFile(sampleDataPath, "utf8");
  await writeFile(tempDataPath, sample, "utf8");
  const app = await createApp({ dataPath: tempDataPath });
  server = app.server;
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

test("serves the single-page application", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(body.includes("Civix GC"));
  assert.ok(body.includes("Trade Scope"));
});

test("bid workflow endpoints mutate and persist state", async () => {
  const stateResponse = await fetch(`${baseUrl}/api/state`);
  assert.equal(stateResponse.status, 200);
  const initialState = await stateResponse.json();
  assert.ok(Array.isArray(initialState.projects));
  const targetScope = initialState.tradeScopes[0];
  assert.ok(targetScope, "expected at least one trade scope");
  const subcontractorId = initialState.subcontractors[0]?.id;
  assert.ok(subcontractorId, "expected a subcontractor id");

  const createBidResponse = await fetch(
    `${baseUrl}/api/trade-scopes/${targetScope.id}/bids`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subcontractorId, fileName: "Concrete Bid.pdf" })
    }
  );
  assert.equal(createBidResponse.status, 201);
  const createdBid = await createBidResponse.json();
  assert.equal(createdBid.status, "processing");

  const parseResponse = await fetch(`${baseUrl}/api/bids/${createdBid.id}/parse`, {
    method: "POST"
  });
  assert.equal(parseResponse.status, 200);
  const parsedBid = await parseResponse.json();
  assert.equal(parsedBid.status, "parsed");
  assert.ok(parsedBid.total > 0);

  const invitationId = targetScope.invitationIds[0];
  assert.ok(invitationId, "expected an invitation id");
  const statusResponse = await fetch(
    `${baseUrl}/api/trade-scopes/${targetScope.id}/invitations/${invitationId}/status`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "submitted" })
    }
  );
  assert.equal(statusResponse.status, 200);
  const updatedInvitation = await statusResponse.json();
  assert.equal(updatedInvitation.status, "submitted");
  assert.ok(updatedInvitation.lastContactedAt);

  const rfiResponse = await fetch(`${baseUrl}/api/trade-scopes/${targetScope.id}/rfis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "Please confirm rebar grade and splice schedule",
      toSubcontractorIds: [subcontractorId]
    })
  });
  assert.equal(rfiResponse.status, 201);
  const createdRfi = await rfiResponse.json();
  assert.equal(createdRfi.status, "open");

  const respondResponse = await fetch(`${baseUrl}/api/rfis/${createdRfi.id}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromSubcontractorId: subcontractorId,
      body: "We will include Grade 60 rebar per specifications.",
      status: "resolved"
    })
  });
  assert.equal(respondResponse.status, 200);
  const responsePayload = await respondResponse.json();
  assert.equal(responsePayload.fromSubcontractorId, subcontractorId);

  const nudgeResponse = await fetch(`${baseUrl}/api/trade-scopes/${targetScope.id}/nudge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitationIds: [invitationId] })
  });
  assert.equal(nudgeResponse.status, 200);

  const updatedStateResponse = await fetch(`${baseUrl}/api/state`);
  const updatedState = await updatedStateResponse.json();
  const savedBid = updatedState.bids.find((bid) => bid.id === createdBid.id);
  assert.ok(savedBid, "created bid should be present in updated state");
  assert.equal(savedBid.status, "parsed");

  const savedRfi = updatedState.rfis.find((rfi) => rfi.id === createdRfi.id);
  assert.ok(savedRfi);
  assert.equal(savedRfi.status, "resolved");
  assert.equal(savedRfi.responses.length, 1);

  const fileContents = await readFile(tempDataPath, "utf8");
  const persisted = JSON.parse(fileContents);
  const persistedBid = persisted.bids.find((bid) => bid.id === createdBid.id);
  assert.ok(persistedBid, "expected bid to persist to disk");
  assert.equal(persistedBid.status, "parsed");
  assert.ok(persistedBid.total > 0);

  const persistedInvitation = persisted.invitations.find((inv) => inv.id === invitationId);
  assert.equal(persistedInvitation.status, "submitted");
  assert.ok(persistedInvitation.lastContactedAt);

  const persistedRfi = persisted.rfis.find((rfi) => rfi.id === createdRfi.id);
  assert.equal(persistedRfi.status, "resolved");
  assert.equal(persistedRfi.responses.length, 1);

  const nudgeEvents = persisted.events.filter((event) => event.type === "nudge_sent");
  assert.ok(
    nudgeEvents.some((event) => event.payload?.invitationIds?.includes(invitationId))
  );
});
