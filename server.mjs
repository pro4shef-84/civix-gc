import { createServer } from "http";
import { readFile, writeFile, stat } from "fs/promises";
import { createReadStream } from "fs";
import { dirname, extname, join, normalize } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, "public");
const dataPath = join(__dirname, "data", "sample-data.json");

let state = JSON.parse(await readFile(dataPath, "utf8"));
let saving = false;
const pendingSaves = [];

const mediaTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, status, text, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers
  });
  res.end(text);
}

async function persist() {
  if (saving) {
    await new Promise((resolve) => pendingSaves.push(resolve));
    return;
  }
  saving = true;
  try {
    await writeFile(dataPath, JSON.stringify(state, null, 2));
  } finally {
    saving = false;
    while (pendingSaves.length > 0) {
      const next = pendingSaves.shift();
      next();
    }
  }
}

function nowISO() {
  return new Date().toISOString();
}

function findById(collection, id) {
  return collection.find((item) => item.id === id);
}

function ensureTradeScope(id) {
  const tradeScope = findById(state.tradeScopes, id);
  if (!tradeScope) {
    const error = new Error("Trade scope not found");
    error.status = 404;
    throw error;
  }
  return tradeScope;
}

function ensureBid(id) {
  const bid = findById(state.bids, id);
  if (!bid) {
    const error = new Error("Bid not found");
    error.status = 404;
    throw error;
  }
  return bid;
}

function ensureInvitation(id) {
  const invitation = findById(state.invitations, id);
  if (!invitation) {
    const error = new Error("Invitation not found");
    error.status = 404;
    throw error;
  }
  return invitation;
}

function ensureRfi(id) {
  const rfi = findById(state.rfis, id);
  if (!rfi) {
    const error = new Error("RFI not found");
    error.status = 404;
    throw error;
  }
  return rfi;
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    const err = new Error("Invalid JSON body");
    err.status = 400;
    throw err;
  }
}

function summarizeState() {
  const projects = state.projects.map((project) => {
    const tradeScopes = project.tradeScopeIds
      .map((id) => state.tradeScopes.find((ts) => ts.id === id))
      .filter(Boolean);
    const totalInvites = tradeScopes.reduce((sum, scope) => sum + scope.invitationIds.length, 0);
    const submitted = tradeScopes.reduce((sum, scope) => {
      return (
        sum +
        scope.invitationIds.filter((invId) => {
          const invitation = findById(state.invitations, invId);
          return invitation?.status === "submitted";
        }).length
      );
    }, 0);
    return {
      ...project,
      tradeScopes: tradeScopes.map((scope) => ({
        id: scope.id,
        name: scope.name,
        csiDivision: scope.csiDivision,
        bidCount: scope.bidIds.length,
        openRfiCount: scope.rfiIds.filter((rfiId) => {
          const rfi = findById(state.rfis, rfiId);
          return rfi?.status !== "resolved";
        }).length
      })),
      invitationProgress: totalInvites === 0 ? 0 : Math.round((submitted / totalInvites) * 100)
    };
  });

  return {
    ...state,
    projects
  };
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/state") {
      sendJson(res, 200, summarizeState());
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/trade-scopes\/[^/]+\/bids$/)) {
      const tradeScopeId = url.pathname.split("/")[3];
      const tradeScope = ensureTradeScope(tradeScopeId);
      const body = await parseBody(req);
      if (!body?.subcontractorId || !body?.fileName) {
        throw Object.assign(new Error("Missing subcontractorId or fileName"), { status: 400 });
      }
      const newBid = {
        id: createId("bid"),
        tradeScopeId,
        subcontractorId: body.subcontractorId,
        fileName: body.fileName,
        uploadedAt: nowISO(),
        status: "processing",
        total: null,
        parsedLines: []
      };
      state.bids.push(newBid);
      if (!tradeScope.bidIds.includes(newBid.id)) {
        tradeScope.bidIds.push(newBid.id);
      }
      await persist();
      sendJson(res, 201, newBid);
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/bids\/[^/]+\/parse$/)) {
      const bidId = url.pathname.split("/")[3];
      const bid = ensureBid(bidId);
      bid.status = "parsed";
      if (!Array.isArray(bid.parsedLines) || bid.parsedLines.length === 0) {
        bid.parsedLines = [
          {
            id: createId("line"),
            description: "General Conditions",
            qty: 1,
            unit: "LS",
            price: Math.round(Math.random() * 50000) + 25000,
            confidence: 0.82,
            csiCode: "01 50 00"
          }
        ];
      }
      bid.total = bid.parsedLines.reduce((sum, line) => sum + (line.price ?? 0), 0);
      await persist();
      sendJson(res, 200, bid);
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/trade-scopes\/[^/]+\/invitations\/[^/]+\/status$/)) {
      const [, , , tradeScopeId, , invitationId] = url.pathname.split("/");
      ensureTradeScope(tradeScopeId);
      const invitation = ensureInvitation(invitationId);
      const body = await parseBody(req);
      if (!body?.status) {
        throw Object.assign(new Error("Missing status"), { status: 400 });
      }
      invitation.status = body.status;
      invitation.lastContactedAt = nowISO();
      await persist();
      sendJson(res, 200, invitation);
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/trade-scopes\/[^/]+\/rfis$/)) {
      const tradeScopeId = url.pathname.split("/")[3];
      ensureTradeScope(tradeScopeId);
      const body = await parseBody(req);
      if (!body?.question || !Array.isArray(body?.toSubcontractorIds)) {
        throw Object.assign(new Error("Invalid RFI payload"), { status: 400 });
      }
      const rfi = {
        id: createId("rfi"),
        tradeScopeId,
        question: body.question,
        toSubcontractorIds: body.toSubcontractorIds,
        status: "open",
        createdAt: nowISO(),
        responses: []
      };
      state.rfis.push(rfi);
      const tradeScope = ensureTradeScope(tradeScopeId);
      tradeScope.rfiIds.push(rfi.id);
      await persist();
      sendJson(res, 201, rfi);
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/rfis\/[^/]+\/respond$/)) {
      const rfiId = url.pathname.split("/")[3];
      const rfi = ensureRfi(rfiId);
      const body = await parseBody(req);
      if (!body?.fromSubcontractorId || !body?.body) {
        throw Object.assign(new Error("Missing response payload"), { status: 400 });
      }
      const response = {
        id: createId("rfi-resp"),
        fromSubcontractorId: body.fromSubcontractorId,
        body: body.body,
        respondedAt: nowISO()
      };
      rfi.responses.push(response);
      rfi.status = body.status ?? "open";
      await persist();
      sendJson(res, 200, response);
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/trade-scopes\/[^/]+\/nudge$/)) {
      const tradeScopeId = url.pathname.split("/")[3];
      ensureTradeScope(tradeScopeId);
      const body = await parseBody(req);
      const invitationIds = Array.isArray(body?.invitationIds) ? body.invitationIds : [];
      const event = {
        id: createId("event"),
        tradeScopeId,
        type: "nudge_sent",
        payload: { invitationIds },
        createdAt: nowISO()
      };
      state.events.push(event);
      invitationIds.forEach((id) => {
        const invitation = state.invitations.find((item) => item.id === id);
        if (invitation) {
          invitation.lastContactedAt = event.createdAt;
        }
      });
      await persist();
      sendJson(res, 200, event);
      return;
    }

    throw Object.assign(new Error("Not found"), { status: 404 });
  } catch (error) {
    const status = error.status ?? 500;
    if (status >= 500) {
      console.error(error);
    }
    sendJson(res, status, { error: error.message ?? "Unexpected error" });
  }
}

async function serveStatic(res, filePath) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      return serveStatic(res, join(filePath, "index.html"));
    }
    const ext = extname(filePath).toLowerCase();
    const type = mediaTypes[ext] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(res, 404, "Not found");
    } else {
      console.error(error);
      sendText(res, 500, "Internal server error");
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  let relativePath = url.pathname;
  if (relativePath === "/") {
    relativePath = "/index.html";
  }
  const normalized = normalize(relativePath).replace(/^[/\\]/, "");
  const safePath = normalized.startsWith("..") ? "index.html" : normalized;
  const filePath = join(publicDir, safePath);
  await serveStatic(res, filePath);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(port, () => {
  console.log(`Civix GC demo server running on http://localhost:${port}`);
});
