const appRoot = document.getElementById("app");
const toastRoot = document.getElementById("toast-root");
const navProjects = document.getElementById("nav-projects");
const navTradeScope = document.getElementById("nav-trade-scope");
const clockElement = document.getElementById("clock");

const appState = {
  view: "projects",
  data: null,
  loading: true,
  selectedProjectId: null,
  selectedTradeScopeId: null,
  activeTabs: {},
  pendingRequest: false
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error ?? `Request failed with ${response.status}`);
  }
  return response.json();
}

function formatDate(iso) {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatRelative(iso) {
  if (!iso) return "—";
  const now = Date.now();
  const target = new Date(iso).getTime();
  const diff = target - now;
  const abs = Math.abs(diff);
  const hours = Math.round(abs / (1000 * 60 * 60));
  if (hours < 24) {
    return diff >= 0 ? `${hours}h remaining` : `${hours}h ago`;
  }
  const days = Math.round(abs / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `${days}d remaining` : `${days}d ago`;
}

function formatCurrency(value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: options.currency ?? "USD",
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0
  });
  return formatter.format(Number(value));
}

function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

function showToast(message, variant = "info") {
  const template = document.getElementById("toast-template");
  if (!template) return;
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.dataset.variant = variant;
  toast.querySelector(".toast-message").textContent = message;
  const closeButton = toast.querySelector(".toast-close");
  const remove = () => toast.remove();
  closeButton.addEventListener("click", remove);
  setTimeout(remove, 4000);
  toastRoot.appendChild(toast);
}

function setView(view) {
  appState.view = view;
  render();
}

function setActiveTab(tradeScopeId, tabId) {
  appState.activeTabs[tradeScopeId] = tabId;
  render();
}

function selectTradeScope(projectId, tradeScopeId) {
  appState.selectedProjectId = projectId;
  appState.selectedTradeScopeId = tradeScopeId;
  if (!appState.activeTabs[tradeScopeId]) {
    appState.activeTabs[tradeScopeId] = "bids";
  }
  appState.view = "trade-scope";
  render();
}

function getProjectById(id) {
  return appState.data?.projects?.find((project) => project.id === id) ?? null;
}

function getTradeScopeById(id) {
  return appState.data?.tradeScopes?.find((scope) => scope.id === id) ?? null;
}

function getBidsForTradeScope(tradeScopeId) {
  return appState.data?.bids?.filter((bid) => bid.tradeScopeId === tradeScopeId) ?? [];
}

function getInvitationsForTradeScope(tradeScopeId) {
  return appState.data?.invitations?.filter((inv) => inv.tradeScopeId === tradeScopeId) ?? [];
}

function getRfisForTradeScope(tradeScopeId) {
  return appState.data?.rfis?.filter((rfi) => rfi.tradeScopeId === tradeScopeId) ?? [];
}

function getSubcontractor(id) {
  return appState.data?.subcontractors?.find((sub) => sub.id === id) ?? null;
}

function computeBidStatusBadge(status) {
  const map = {
    parsed: { text: "Parsed", tone: "#166534", bg: "#dcfce7" },
    processing: { text: "Processing", tone: "#1d4ed8", bg: "#dbeafe" },
    needs_review: { text: "Needs Review", tone: "#92400e", bg: "#fef3c7" }
  };
  const config = map[status] ?? { text: status ?? "Unknown", tone: "#334155", bg: "#f1f5f9" };
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.style.background = config.bg;
  badge.style.color = config.tone;
  badge.textContent = config.text;
  return badge;
}

async function refreshState() {
  appState.loading = true;
  render();
  try {
    const data = await fetchJson("/api/state");
    appState.data = data;
    if (!appState.selectedProjectId && data.projects?.length) {
      appState.selectedProjectId = data.projects[0].id;
    }
    if (!appState.selectedTradeScopeId && data.projects?.length) {
      const project = getProjectById(appState.selectedProjectId);
      const tradeScopeId = project?.tradeScopeIds?.[0];
      if (tradeScopeId) {
        appState.selectedTradeScopeId = tradeScopeId;
      }
    }
  } catch (error) {
    console.error(error);
    showToast(error.message ?? "Failed to load data", "error");
  } finally {
    appState.loading = false;
    render();
  }
}

function renderLoadingState() {
  const panel = document.createElement("section");
  panel.className = "panel";
  const loader = document.createElement("div");
  loader.textContent = "Loading project data…";
  panel.appendChild(loader);
  appRoot.appendChild(panel);
}

function renderProjectsView() {
  const panel = document.createElement("section");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "panel-header";
  const title = document.createElement("h2");
  title.textContent = "Projects";
  const subtitle = document.createElement("small");
  subtitle.textContent = "Bid calendar and invited scopes";
  header.appendChild(title);
  header.appendChild(subtitle);
  panel.appendChild(header);

  if (!appState.data?.projects?.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No projects in your workspace yet.";
    panel.appendChild(empty);
    appRoot.appendChild(panel);
    return;
  }

  const tableContainer = document.createElement("div");
  tableContainer.className = "table-container";
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>
      <th>Project</th>
      <th>Bid Due</th>
      <th>Trade Scopes</th>
      <th>Invitations Submitted</th>
      <th></th>
    </tr>`;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  appState.data.projects.forEach((project) => {
    const row = document.createElement("tr");
    const tradeScopes = project.tradeScopes ?? [];

    const projectCell = document.createElement("td");
    const projectName = document.createElement("div");
    projectName.textContent = project.name;
    const scopeCount = document.createElement("small");
    scopeCount.style.display = "block";
    scopeCount.style.color = "#64748b";
    scopeCount.textContent = `${tradeScopes.length} trade scope${tradeScopes.length === 1 ? "" : "s"}`;
    projectCell.appendChild(projectName);
    projectCell.appendChild(scopeCount);

    const dueCell = document.createElement("td");
    dueCell.textContent = formatDateTime(project.bidDueAt);

    const scopeCell = document.createElement("td");
    scopeCell.className = "chip-list";
    tradeScopes.forEach((scope) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = `${scope.name}`;
      chip.addEventListener("click", () => selectTradeScope(project.id, scope.id));
      scopeCell.appendChild(chip);
    });

    const inviteCell = document.createElement("td");
    inviteCell.textContent = `${project.invitationProgress}% submitted`;

    const actionCell = document.createElement("td");
    const viewButton = document.createElement("button");
    viewButton.className = "button";
    viewButton.dataset.variant = "secondary";
    viewButton.textContent = "Open";
    if (tradeScopes.length === 0) {
      viewButton.disabled = true;
    }
    viewButton.addEventListener("click", () => {
      const tradeScopeId = tradeScopes[0]?.id;
      if (tradeScopeId) {
        selectTradeScope(project.id, tradeScopeId);
      }
    });
    actionCell.appendChild(viewButton);

    row.appendChild(projectCell);
    row.appendChild(dueCell);
    row.appendChild(scopeCell);
    row.appendChild(inviteCell);
    row.appendChild(actionCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
  panel.appendChild(tableContainer);
  appRoot.appendChild(panel);
}

function renderTradeScopeView() {
  const project = getProjectById(appState.selectedProjectId);
  const tradeScope = getTradeScopeById(appState.selectedTradeScopeId);

  if (!project || !tradeScope) {
    const panel = document.createElement("section");
    panel.className = "panel";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Select a trade scope from the Projects view to begin leveling.";
    panel.appendChild(empty);
    appRoot.appendChild(panel);
    return;
  }

  const headerPanel = document.createElement("section");
  headerPanel.className = "panel";
  const header = document.createElement("div");
  header.className = "panel-header";
  const title = document.createElement("div");
  const heading = document.createElement("h2");
  heading.textContent = `${tradeScope.name}`;
  const subtitle = document.createElement("small");
  subtitle.textContent = `${project.name} • Due ${formatDate(project.bidDueAt)} (${formatRelative(project.bidDueAt)})`;
  title.appendChild(heading);
  title.appendChild(subtitle);

  const selector = document.createElement("select");
  selector.className = "chip";
  project.tradeScopeIds.forEach((scopeId) => {
    const scope = getTradeScopeById(scopeId);
    if (!scope) return;
    const option = document.createElement("option");
    option.value = scope.id;
    option.textContent = scope.name;
    if (scope.id === tradeScope.id) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
  selector.addEventListener("change", (event) => {
    selectTradeScope(project.id, event.target.value);
  });

  header.appendChild(title);
  header.appendChild(selector);
  headerPanel.appendChild(header);

  const metricsGrid = document.createElement("div");
  metricsGrid.className = "grid two";

  const bids = getBidsForTradeScope(tradeScope.id);
  const invitations = getInvitationsForTradeScope(tradeScope.id);
  const submitted = invitations.filter((inv) => inv.status === "submitted").length;
  const pending = invitations.filter((inv) => ["invited", "interested"].includes(inv.status)).length;
  const openRfis = getRfisForTradeScope(tradeScope.id).filter((rfi) => rfi.status !== "resolved").length;

  metricsGrid.appendChild(createMetricCard("Submitted bids", `${submitted}/${invitations.length}`));
  metricsGrid.appendChild(createMetricCard("Active invites", `${pending}`));
  metricsGrid.appendChild(createMetricCard("Parsed bids", `${bids.filter((bid) => bid.status === "parsed").length}`));
  metricsGrid.appendChild(createMetricCard("Open RFIs", `${openRfis}`));
  headerPanel.appendChild(metricsGrid);
  appRoot.appendChild(headerPanel);

  const tabsPanel = document.createElement("section");
  tabsPanel.className = "panel";

  Object.keys(tabContentRenderers).forEach((key) => delete tabContentRenderers[key]);
  const tabs = [
    { id: "bids", label: "Bids", render: () => renderBidsPanel(tradeScope, bids) },
    { id: "leveling", label: "Leveling", render: () => renderLevelingPanel(tradeScope) },
    { id: "rfq", label: "RFQ Tracker", render: () => renderRfqPanel(tradeScope, invitations) },
    { id: "rfis", label: "RFIs", render: () => renderRfiPanel(tradeScope) },
    { id: "export", label: "Export", render: () => renderExportPanel(tradeScope, project) }
  ];

  tabs.forEach((tab) => tab.render());

  const activeTab = appState.activeTabs[tradeScope.id] ?? "bids";

  const tabList = document.createElement("div");
  tabList.className = "tabs";
  tabs.forEach((tab) => {
    const button = document.createElement("button");
    button.className = "tab-button";
    button.type = "button";
    button.textContent = tab.label;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(tab.id === activeTab));
    button.addEventListener("click", () => setActiveTab(tradeScope.id, tab.id));
    tabList.appendChild(button);
  });
  tabsPanel.appendChild(tabList);

  tabs.forEach((tab) => {
    const panel = document.createElement("div");
    panel.className = "tab-panel";
    panel.dataset.active = String(tab.id === activeTab);
    panel.dataset.tabId = tab.id;
    tabsPanel.appendChild(panel);
  });

  appRoot.appendChild(tabsPanel);

  // After panels appended, render active tab content inside matching panel element
  const activePanel = tabsPanel.querySelector(`.tab-panel[data-tab-id="${activeTab}"]`);
  if (activePanel) {
    activePanel.replaceChildren(...(tabContentRenderers[activeTab]?.() ?? []));
  }
}

const tabContentRenderers = {};

function renderBidsPanel(tradeScope, bids) {
  tabContentRenderers.bids = () => {
    const container = document.createDocumentFragment();
    const layout = document.createElement("div");
    layout.className = "grid two";

    const bidTableCard = document.createElement("div");
    const tableContainer = document.createElement("div");
    tableContainer.className = "table-container";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>
        <th>Subcontractor</th>
        <th>File</th>
        <th>Uploaded</th>
        <th>Status</th>
        <th>Total</th>
        <th></th>
      </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");

    if (bids.length === 0) {
      const emptyRow = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No bids uploaded yet. Drag and drop files below to get started.";
      cell.appendChild(empty);
      emptyRow.appendChild(cell);
      tbody.appendChild(emptyRow);
    }

    bids.forEach((bid) => {
      const row = document.createElement("tr");
      const subcontractor = getSubcontractor(bid.subcontractorId);

      const subCell = document.createElement("td");
      subCell.textContent = subcontractor?.name ?? bid.subcontractorId;

      const fileCell = document.createElement("td");
      fileCell.textContent = bid.fileName;

      const uploadedCell = document.createElement("td");
      uploadedCell.textContent = formatDateTime(bid.uploadedAt);

      const statusCell = document.createElement("td");
      statusCell.appendChild(computeBidStatusBadge(bid.status));

      const totalCell = document.createElement("td");
      totalCell.textContent = bid.total ? formatCurrency(bid.total) : "—";

      const actionCell = document.createElement("td");
      if (bid.status !== "parsed") {
        const parseButton = document.createElement("button");
        parseButton.className = "button";
        parseButton.dataset.variant = "primary";
        parseButton.textContent = "Parse";
        parseButton.addEventListener("click", async () => {
          try {
            await fetchJson(`/api/bids/${bid.id}/parse`, { method: "POST" });
            showToast(`Parse job completed for ${bid.fileName}`);
            await refreshState();
          } catch (error) {
            showToast(error.message, "error");
          }
        });
        actionCell.appendChild(parseButton);
      }

      row.appendChild(subCell);
      row.appendChild(fileCell);
      row.appendChild(uploadedCell);
      row.appendChild(statusCell);
      row.appendChild(totalCell);
      row.appendChild(actionCell);

      tbody.appendChild(row);

      if (bid.parsedLines?.length) {
        const detailRow = document.createElement("tr");
        const detailCell = document.createElement("td");
        detailCell.colSpan = 6;
        const linesList = document.createElement("div");
        linesList.className = "chip-list";
        bid.parsedLines.forEach((line) => {
          const lineChip = document.createElement("div");
          lineChip.className = "chip";
          lineChip.textContent = `${line.description} (${formatCurrency(line.price, { maximumFractionDigits: 0 })})`;
          linesList.appendChild(lineChip);
        });
        detailCell.appendChild(linesList);
        detailRow.appendChild(detailCell);
        tbody.appendChild(detailRow);
      }
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    bidTableCard.appendChild(tableContainer);

    const uploadCard = document.createElement("div");
    uploadCard.className = "panel";
    uploadCard.style.padding = "1rem";
    const uploadTitle = document.createElement("h3");
    uploadTitle.textContent = "Upload new bid";
    const uploadForm = document.createElement("form");
    uploadForm.className = "form-grid";

    const subcontractorField = document.createElement("div");
    subcontractorField.className = "form-field";
    const subcontractorLabel = document.createElement("label");
    subcontractorLabel.textContent = "Subcontractor";
    subcontractorLabel.setAttribute("for", "bid-subcontractor");
    const subcontractorSelect = document.createElement("select");
    subcontractorSelect.id = "bid-subcontractor";
    subcontractorSelect.required = true;
    subcontractorSelect.innerHTML = `<option value="">Select vendor…</option>`;
    getInvitationsForTradeScope(tradeScope.id).forEach((inv) => {
      const sub = getSubcontractor(inv.subcontractorId);
      if (!sub) return;
      const option = document.createElement("option");
      option.value = sub.id;
      option.textContent = sub.name;
      subcontractorSelect.appendChild(option);
    });
    subcontractorField.appendChild(subcontractorLabel);
    subcontractorField.appendChild(subcontractorSelect);

    const fileField = document.createElement("div");
    fileField.className = "form-field";
    const fileLabel = document.createElement("label");
    fileLabel.textContent = "Bid file";
    fileLabel.setAttribute("for", "bid-file");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "bid-file";
    fileInput.required = true;
    fileField.appendChild(fileLabel);
    fileField.appendChild(fileInput);

    const submitButton = document.createElement("button");
    submitButton.className = "button";
    submitButton.dataset.variant = "primary";
    submitButton.type = "submit";
    submitButton.textContent = "Upload";

    uploadForm.appendChild(subcontractorField);
    uploadForm.appendChild(fileField);
    uploadForm.appendChild(submitButton);

    uploadForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!fileInput.files?.length || !subcontractorSelect.value) return;
      const file = fileInput.files[0];
      try {
        await fetchJson(`/api/trade-scopes/${tradeScope.id}/bids`, {
          method: "POST",
          body: JSON.stringify({
            subcontractorId: subcontractorSelect.value,
            fileName: file.name
          })
        });
        showToast(`Uploaded ${file.name}`);
        fileInput.value = "";
        subcontractorSelect.value = "";
        await refreshState();
      } catch (error) {
        showToast(error.message, "error");
      }
    });

    uploadCard.appendChild(uploadTitle);
    uploadCard.appendChild(uploadForm);

    layout.appendChild(bidTableCard);
    layout.appendChild(uploadCard);
    container.appendChild(layout);
    return [container];
  };
}

function renderLevelingPanel(tradeScope) {
  tabContentRenderers.leveling = () => {
    const fragment = document.createDocumentFragment();
    const matrix = document.createElement("div");
    matrix.className = "leveling-grid";

    const subcontractorIds = Array.from(
      new Set(
        tradeScope.levelingRows.flatMap((row) => Object.keys(row.subs ?? {}))
      )
    );

    const headerRow = document.createElement("div");
    headerRow.className = "leveling-header";
    const scopeHeader = document.createElement("div");
    scopeHeader.className = "leveling-header-cell leveling-scope-cell";
    scopeHeader.textContent = "Normalized Scope";
    headerRow.appendChild(scopeHeader);
    subcontractorIds.forEach((subId) => {
      const sub = getSubcontractor(subId);
      const cell = document.createElement("div");
      cell.className = "leveling-header-cell";
      cell.textContent = sub?.name ?? subId;
      headerRow.appendChild(cell);
    });
    matrix.appendChild(headerRow);

    tradeScope.levelingRows.forEach((row) => {
      const scopeCell = document.createElement("div");
      scopeCell.className = "leveling-cell leveling-scope-cell";
      const title = document.createElement("div");
      title.textContent = row.description;
      const meta = document.createElement("small");
      meta.style.display = "block";
      if (row.quantity && row.unit) {
        meta.textContent = `${formatNumber(row.quantity)} ${row.unit}`;
      } else if (row.unit) {
        meta.textContent = row.unit;
      } else {
        meta.textContent = "";
      }
      scopeCell.appendChild(title);
      scopeCell.appendChild(meta);
      matrix.appendChild(scopeCell);

      subcontractorIds.forEach((subId) => {
        const value = row.subs?.[subId];
        const cell = document.createElement("div");
        cell.className = "leveling-cell";
        if (value?.status) {
          cell.dataset.status = value.status;
        }
        if (value?.price !== null && value?.price !== undefined) {
          const displayValue = row.unit === "SF" || row.unit === "EA" ? formatNumber(value.price) : formatCurrency(value.price);
          cell.textContent = displayValue;
        } else {
          cell.textContent = value?.status === "missing" ? "Missing" : "—";
        }
        if (value?.notes) {
          const note = document.createElement("div");
          note.style.color = "#64748b";
          note.style.fontSize = "0.78rem";
          note.textContent = value.notes;
          cell.appendChild(note);
        }
        matrix.appendChild(cell);
      });
    });

    fragment.appendChild(matrix);
    return [fragment];
  };
}

function renderRfqPanel(tradeScope, invitations) {
  tabContentRenderers.rfq = () => {
    const container = document.createDocumentFragment();
    const formSection = document.createElement("div");
    formSection.className = "grid two";

    const listCard = document.createElement("div");
    const listTableContainer = document.createElement("div");
    listTableContainer.className = "table-container";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>
        <th>Subcontractor</th>
        <th>Status</th>
        <th>Last Contact</th>
        <th></th>
      </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");

    const actionableInvites = [];

    invitations.forEach((invitation) => {
      const row = document.createElement("tr");
      const subcontractor = getSubcontractor(invitation.subcontractorId);

      const subCell = document.createElement("td");
      subCell.textContent = subcontractor?.name ?? invitation.subcontractorId;

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.dataset.variant = invitation.status;
      badge.textContent = invitation.status.replace(/_/g, " ");
      statusCell.appendChild(badge);

      const lastContactCell = document.createElement("td");
      lastContactCell.textContent = invitation.lastContactedAt ? formatDateTime(invitation.lastContactedAt) : "—";

      const actionCell = document.createElement("td");
      const statusSelect = document.createElement("select");
      statusSelect.className = "chip";
      ["invited", "interested", "needs_clarification", "submitted", "no_bid"].forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status.replace(/_/g, " ");
        if (status === invitation.status) {
          option.selected = true;
        }
        statusSelect.appendChild(option);
      });
      statusSelect.addEventListener("change", async (event) => {
        try {
          await fetchJson(`/api/trade-scopes/${tradeScope.id}/invitations/${invitation.id}/status`, {
            method: "POST",
            body: JSON.stringify({ status: event.target.value })
          });
          showToast(`Updated ${subcontractor?.name ?? "invitation"} to ${event.target.value}`);
          await refreshState();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
      actionCell.appendChild(statusSelect);

      if (["invited", "interested", "needs_clarification"].includes(invitation.status)) {
        actionableInvites.push(invitation.id);
      }

      row.appendChild(subCell);
      row.appendChild(statusCell);
      row.appendChild(lastContactCell);
      row.appendChild(actionCell);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    listTableContainer.appendChild(table);
    listCard.appendChild(listTableContainer);

    const actionsCard = document.createElement("div");
    actionsCard.className = "panel";
    actionsCard.style.padding = "1.25rem";

    const actionTitle = document.createElement("h3");
    actionTitle.textContent = "Auto-nudge";
    const actionDescription = document.createElement("p");
    actionDescription.textContent = "Remind invited subs that have not submitted their bids.";

    const nudgeButton = document.createElement("button");
    nudgeButton.className = "button";
    nudgeButton.dataset.variant = "primary";
    nudgeButton.textContent = `Send nudge (${actionableInvites.length})`;
    nudgeButton.disabled = actionableInvites.length === 0;
    nudgeButton.addEventListener("click", async () => {
      if (actionableInvites.length === 0) return;
      try {
        await fetchJson(`/api/trade-scopes/${tradeScope.id}/nudge`, {
          method: "POST",
          body: JSON.stringify({ invitationIds: actionableInvites })
        });
        showToast(`Queued ${actionableInvites.length} reminders.`);
        await refreshState();
      } catch (error) {
        showToast(error.message, "error");
      }
    });

    actionsCard.appendChild(actionTitle);
    actionsCard.appendChild(actionDescription);
    actionsCard.appendChild(nudgeButton);

    formSection.appendChild(listCard);
    formSection.appendChild(actionsCard);
    container.appendChild(formSection);
    return [container];
  };
}

function renderRfiPanel(tradeScope) {
  tabContentRenderers.rfis = () => {
    const fragment = document.createDocumentFragment();
    const rfis = getRfisForTradeScope(tradeScope.id);

    const listCard = document.createElement("div");
    listCard.className = "timeline";

    if (rfis.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No RFIs for this scope yet.";
      fragment.appendChild(empty);
    } else {
      rfis
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((rfi) => {
          const entry = document.createElement("div");
          entry.className = "timeline-entry";
          const title = document.createElement("strong");
          title.textContent = rfi.question;
          const meta = document.createElement("div");
          meta.style.color = "#64748b";
          const recipients = rfi.toSubcontractorIds
            .map((id) => getSubcontractor(id)?.name ?? id)
            .join(", ");
          meta.textContent = `Sent ${formatDateTime(rfi.createdAt)} • To ${recipients}`;
          entry.appendChild(title);
          entry.appendChild(meta);

          const statusBadge = document.createElement("div");
          statusBadge.className = "badge";
          statusBadge.dataset.variant = rfi.status === "resolved" ? "submitted" : "needs_clarification";
          statusBadge.textContent = rfi.status;
          entry.appendChild(statusBadge);

          if (rfi.responses?.length) {
            const responsesList = document.createElement("div");
            responsesList.style.marginTop = "0.75rem";
            rfi.responses.forEach((response) => {
              const responseBlock = document.createElement("div");
              responseBlock.style.background = "#f8fafc";
              responseBlock.style.borderRadius = "12px";
              responseBlock.style.padding = "0.75rem";
              responseBlock.style.marginBottom = "0.5rem";
              const header = document.createElement("div");
              header.style.display = "flex";
              header.style.justifyContent = "space-between";
              header.style.fontWeight = "600";
              header.textContent = getSubcontractor(response.fromSubcontractorId)?.name ?? response.fromSubcontractorId;
              const time = document.createElement("span");
              time.style.fontSize = "0.8rem";
              time.style.color = "#64748b";
              time.textContent = formatDateTime(response.respondedAt);
              header.appendChild(time);
              responseBlock.appendChild(header);
              const body = document.createElement("p");
              body.textContent = response.body;
              body.style.marginTop = "0.5rem";
              responseBlock.appendChild(body);
              responsesList.appendChild(responseBlock);
            });
            entry.appendChild(responsesList);
          }

          listCard.appendChild(entry);
        });
      fragment.appendChild(listCard);
    }

    const formCard = document.createElement("div");
    formCard.className = "panel";
    formCard.style.padding = "1.25rem";
    const formTitle = document.createElement("h3");
    formTitle.textContent = "Log new RFI";
    const form = document.createElement("form");
    form.className = "form-grid";

    const questionField = document.createElement("div");
    questionField.className = "form-field";
    const questionLabel = document.createElement("label");
    questionLabel.textContent = "Question";
    questionLabel.setAttribute("for", "rfi-question");
    const questionInput = document.createElement("textarea");
    questionInput.id = "rfi-question";
    questionInput.required = true;
    questionField.appendChild(questionLabel);
    questionField.appendChild(questionInput);

    const recipientsField = document.createElement("div");
    recipientsField.className = "form-field";
    const recipientsLabel = document.createElement("label");
    recipientsLabel.textContent = "Send to";
    recipientsLabel.setAttribute("for", "rfi-recipients");
    const recipientsSelect = document.createElement("select");
    recipientsSelect.id = "rfi-recipients";
    recipientsSelect.multiple = true;
    getInvitationsForTradeScope(tradeScope.id).forEach((inv) => {
      const sub = getSubcontractor(inv.subcontractorId);
      if (!sub) return;
      const option = document.createElement("option");
      option.value = sub.id;
      option.textContent = sub.name;
      recipientsSelect.appendChild(option);
    });
    recipientsField.appendChild(recipientsLabel);
    recipientsField.appendChild(recipientsSelect);

    const submitButton = document.createElement("button");
    submitButton.className = "button";
    submitButton.dataset.variant = "primary";
    submitButton.type = "submit";
    submitButton.textContent = "Send RFI";

    form.appendChild(questionField);
    form.appendChild(recipientsField);
    form.appendChild(submitButton);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const selectedRecipients = Array.from(recipientsSelect.selectedOptions).map((option) => option.value);
      if (!selectedRecipients.length || !questionInput.value.trim()) {
        showToast("Add a question and at least one recipient", "error");
        return;
      }
      try {
        await fetchJson(`/api/trade-scopes/${tradeScope.id}/rfis`, {
          method: "POST",
          body: JSON.stringify({
            question: questionInput.value.trim(),
            toSubcontractorIds: selectedRecipients
          })
        });
        showToast("RFI sent to selected subcontractors");
        questionInput.value = "";
        recipientsSelect.selectedIndex = -1;
        await refreshState();
      } catch (error) {
        showToast(error.message, "error");
      }
    });

    formCard.appendChild(formTitle);
    formCard.appendChild(form);

    fragment.appendChild(formCard);
    return [fragment];
  };
}

function renderExportPanel(tradeScope, project) {
  tabContentRenderers.export = () => {
    const fragment = document.createDocumentFragment();
    const card = document.createElement("div");
    card.className = "grid two";

    const summary = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = "Export leveled sheet";
    const description = document.createElement("p");
    description.textContent = "Download a stamped CSV snapshot of the current leveling matrix.";

    const exportButton = document.createElement("button");
    exportButton.className = "button";
    exportButton.dataset.variant = "primary";
    exportButton.textContent = "Download CSV";
    exportButton.addEventListener("click", () => {
      const csv = buildLevelingCsv(tradeScope, project);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.name.replace(/\s+/g, "-")}-${tradeScope.name.replace(/\s+/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Export generated");
    });

    summary.appendChild(heading);
    summary.appendChild(description);
    summary.appendChild(exportButton);

    const activity = document.createElement("div");
    activity.className = "panel";
    activity.style.padding = "1rem";
    const activityHeading = document.createElement("h4");
    activityHeading.textContent = "Recent activity";
    const events = appState.data?.events?.filter((event) => event.tradeScopeId === tradeScope.id) ?? [];

    const activityList = document.createElement("div");
    if (events.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No email nudges sent yet.";
      activityList.appendChild(empty);
    } else {
      events
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((event) => {
          const item = document.createElement("div");
          item.style.padding = "0.75rem 0";
          const title = document.createElement("div");
          title.textContent = event.type.replace(/_/g, " ");
          const meta = document.createElement("small");
          meta.style.color = "#64748b";
          meta.textContent = formatDateTime(event.createdAt);
          item.appendChild(title);
          item.appendChild(meta);
          activityList.appendChild(item);
        });
    }

    activity.appendChild(activityHeading);
    activity.appendChild(activityList);

    card.appendChild(summary);
    card.appendChild(activity);
    fragment.appendChild(card);
    return [fragment];
  };
}

function buildLevelingCsv(tradeScope, project) {
  const subcontractorIds = Array.from(
    new Set(tradeScope.levelingRows.flatMap((row) => Object.keys(row.subs ?? {})))
  );
  const header = ["Scope Item", ...subcontractorIds.map((id) => getSubcontractor(id)?.name ?? id)];
  const rows = [header];
  tradeScope.levelingRows.forEach((row) => {
    const base = row.description;
    const values = subcontractorIds.map((id) => {
      const value = row.subs?.[id];
      if (!value) return "";
      if (value.price === null || value.price === undefined) {
        return value.status === "missing" ? "Missing" : "";
      }
      return row.unit === "SF" || row.unit === "EA" ? formatNumber(value.price) : formatCurrency(value.price).replace(/[^0-9.\-]/g, "");
    });
    rows.push([base, ...values]);
  });
  const metadata = `Project:,${project.name}\nTrade Scope:,${tradeScope.name}\nGenerated:,${new Date().toISOString()}\n`;
  const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${metadata}\n${csvContent}\n`;
}

function createMetricCard(label, value) {
  const card = document.createElement("div");
  card.className = "panel";
  card.style.padding = "1.1rem";
  const labelEl = document.createElement("div");
  labelEl.style.color = "#64748b";
  labelEl.textContent = label;
  const valueEl = document.createElement("div");
  valueEl.style.fontSize = "1.5rem";
  valueEl.style.fontWeight = "700";
  valueEl.textContent = value;
  card.appendChild(labelEl);
  card.appendChild(valueEl);
  return card;
}

function clearApp() {
  while (appRoot.firstChild) {
    appRoot.removeChild(appRoot.firstChild);
  }
}

function updateNavState() {
  navProjects.classList.toggle("nav-button--active", appState.view === "projects");
  navTradeScope.classList.toggle("nav-button--active", appState.view === "trade-scope");
  navTradeScope.disabled = !appState.selectedTradeScopeId;
}

function render() {
  updateNavState();
  clearApp();

  if (appState.loading) {
    renderLoadingState();
    return;
  }

  if (appState.view === "projects") {
    renderProjectsView();
  } else {
    renderTradeScopeView();
  }
}

navProjects.addEventListener("click", () => setView("projects"));
navTradeScope.addEventListener("click", () => {
  if (appState.selectedTradeScopeId) {
    setView("trade-scope");
  }
});

function startClock() {
  const update = () => {
    const now = new Date();
    clockElement.textContent = now.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };
  update();
  setInterval(update, 1000);
}

startClock();
refreshState();
