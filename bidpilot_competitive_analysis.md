# BidPilot Competitive and User Needs Analysis

## 1) Executive Summary
- Mid-market GCs (\$50–300M revenue, 3–10 estimators) rely on Excel and email for bid leveling; incumbents focus on bid distribution or full estimating suites and largely ignore unstructured proposal normalization and risk scoring.
- BidPilot’s wedge is converting unstructured subcontractor proposals (PDF/email/scope letters) into structured scope coverage, exclusions, and risk signals that can be exported into existing estimating workflows (Procore Estimating, BuildingConnected, Excel/DESTINI).
- Competitive risk is low on the specific normalization/risk niche: incumbents provide manual “bid tabs” or generic document AI without construction-specific scope libraries or cross-project learning.
- Buyers value time saved (1–3 days per trade package), reduced scope gaps, and audit-ready rationale; pricing of \$1k–\$3k per estimator/month is defensible if it replaces manual bid leveling labor and rework costs.
- PMF hinges on high-accuracy extraction of scopes/exclusions across trades, trustworthy risk scoring (with explanations), and seamless export back to current estimate files.
- Design partners should be 3–5 GCs with repeatable bid flow (weekly RFQs) and pain around MEP/envelope trades; success metric is >50% reduction in bid leveling cycle time and >80% user trust in detected exclusions.
- MVP should avoid building a sub network or RFQ workflow; focus on ingestion, normalization, risk tags, and push-button export/API connectors to Excel/Procore/BuildingConnected.
- Kill criteria: if exclusion detection accuracy <70% in pilot or exports fail to map into existing estimate templates, the wedge collapses and pricing power erodes.

## 2) Persona & User Needs Analysis

| Persona | Core Jobs-to-Be-Done | Current Workflow (Tools/Artifacts) | Pain Points | PMF-Level Value / ROI Metrics |
| --- | --- | --- | --- | --- |
| Estimator / Precon Manager (economic buyer + daily user) | Level bids, ensure scope completeness, compare apples-to-apples, recommend award | BuildingConnected/Procore Estimating for invites; emails/Box for bid docs; Excel bid tabs; DESTINI/WinEst for estimates | Hours spent retyping scopes; missed exclusions cause change orders; manual risk checks | 50–70% faster bid leveling; fewer scope gaps (tracked change order $$ avoided); defendable audit trail; higher win rate with predictable margins |
| Bid Coordinator (process owner) | Collect bids, track completeness, route to estimators, assemble bid tabs | BuildingConnected/SmartBid for comms; Outlook; Excel trackers; SharePoint | Chasing subs; unstructured PDFs hard to compare; version chaos | Fewer follow-ups; automatic coverage status; single export to existing bid tabs |
| Project Executive / Operations (approver) | Approve award, balance risk, validate exclusions/qualifications | Email digests; executive summaries in Excel/PowerPoint | Low visibility into hidden exclusions; fear of post-award surprises; distrust of rushed leveling | Clear risk score with explanations; scenario comparisons; reduced change-order exposure |
| Subcontractor (supply-side stakeholder) | Submit competitive bids, clarify scope | Email attachments; PDF scope letters; occasional portals | Resubmits due to missing info; unclear GC expectations; slow feedback | Faster clarification cycles; prompts for missing scope items; better chance to win |

## 3) Competitive Landscape

**Buckets**
- Bid management + subcontractor networks: Autodesk BuildingConnected, Procore (Bid Management/Estimating), SmartBid/iSqFt (ConstructConnect), PlanHub.
- Estimating / takeoff acceleration tools: Beck Technology DESTINI Estimator, Procore Estimating (STACK), Trimble WinEst, Togal.ai (AI takeoff), Kreo.
- Bid leveling / precon suites: Destini (bid-day tools), Pype AutoSpecs/Closeout (spec extraction), Nativus/ConCntric (precon), Excel + manual bid tabs (status quo).

**Competitor Profiles**
- **Autodesk BuildingConnected** — Buyer: estimators/precon. Strengths: large sub network, RFQ distribution, bid tracking, integrations. Gaps: no deep unstructured scope extraction; bid leveling mostly manual. Model: system-of-record for invites.
- **Procore (Bid Management & Estimating)** — Buyer: precon teams already on Procore. Strengths: integrated with project management, basic bid forms, estimating via STACK. Gaps: relies on structured forms; limited AI on scope/exclusions; risk scoring absent. Model: add-on in Procore platform.
- **SmartBid/iSqFt (ConstructConnect)** — Buyer: GCs needing sub database + comms. Strengths: directory, compliance tracking. Gaps: minimal bid normalization; manual Excel exports. Model: system-of-record/network.
- **PlanHub** — Buyer: small/mid GC. Strengths: easy RFQ blast, sub marketplace. Gaps: little depth in bid leveling; documents remain unstructured. Model: network platform.
- **Beck DESTINI Estimator** — Buyer: estimating leaders. Strengths: integrated takeoff + estimate + cost history. Gaps: ingestion of unstructured bids limited; bid-day tools manual; heavy implementation. Model: system-of-record suite.
- **Trimble WinEst** — Buyer: enterprise estimators. Strengths: mature database estimating, assemblies. Gaps: no AI ingestion; manual bid tabs. Model: on-prem/legacy system-of-record.
- **Procore Estimating (STACK)** — Buyer: Procore users for takeoff/estimates. Strengths: cloud takeoff, item libraries. Gaps: proposal ingestion weak; exclusions not parsed; no risk scoring. Model: add-on.
- **Togal.ai** — Buyer: estimators needing faster takeoff. Strengths: AI takeoff automation. Gaps: downstream bid normalization/exclusions not addressed. Model: point solution.
- **Kreo** — Buyer: estimators/quantity surveyors. Strengths: AI takeoff + cost estimation. Gaps: sub bid ingestion limited; focus on QS side. Model: point solution/SaaS.
- **Pype AutoSpecs / Autodesk** — Buyer: PMs for submittals. Strengths: spec extraction, compliance. Gaps: not for bids; no leveling. Model: add-on.
- **ConCntric / Nativus** — Buyer: precon teams. Strengths: precon planning dashboards. Gaps: little unstructured bid intelligence; relies on manual inputs. Model: SaaS point solution.
- **Status quo (Excel + email)** — Buyer: everyone. Strengths: flexible. Gaps: slow, error-prone, zero audit trail. Model: manual.

## 4) Competitive Matrix

Capabilities: ✅ strong/native; ⚠️ partial/plug-in; ❌ absent/manual.

| Capability | BuildingConnected | Procore Estimating/Bid Mgmt | SmartBid/iSqFt | PlanHub | DESTINI Estimator | Togal.ai | Kreo | ConCntric | Excel Status Quo | **BidPilot** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RFQ distribution & sub network | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ (by design) |
| Bid intake (email/PDF) | ⚠️ (portal uploads) | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ (email/drag-drop) |
| Unstructured proposal parsing | ❌ | ❌ | ❌ | ❌ | ⚠️ (manual) | ❌ | ⚠️ | ❌ | ❌ | ✅ (AI extraction) |
| Scope normalization to CSI/WBS | ❌ | ⚠️ (manual line items) | ❌ | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ✅ (library + models) |
| Exclusion/assumption detection | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (automated tagging) |
| Bid risk scoring (coverage/quality) | ❌ | ❌ | ❌ | ❌ | ⚠️ (manual checks) | ❌ | ❌ | ❌ | ❌ | ✅ (scoring + rationale) |
| Export to estimate/bid tabs | ⚠️ (CSV/BC) | ⚠️ (Procore/Excel) | ⚠️ | ⚠️ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ (manual) | ✅ (Excel/Procore/BC) |
| Cross-project scope library/learning | ❌ | ⚠️ (item libs) | ❌ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ✅ (auto-learn) |
| Agentic follow-ups/coverage prompts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ (auto reminders) |
| Deployment focus | System-of-record | Platform add-on | System-of-record | Network | System-of-record | Point | Point | Point | Manual | Point plug-in |

## 5) "What’s Missing" (Gap Analysis)

1) **Unstructured proposal ingestion** — Bids arrive as PDFs/emails; incumbents expect portal forms. They prioritize network effects over document AI. BidPilot wins by tolerating messy inputs (email listener + drag/drop) and fast parsing.
2) **Automatic scope normalization** — Current tools rely on manual line mapping. Incumbents avoid trade-specific modeling complexity. BidPilot delivers CSI/WBS mapping with a reusable scope library and cross-project learning.
3) **Exclusion/assumption detection** — Hidden qualifiers drive change orders; no incumbent surfaces them. BidPilot uses NLP classifiers and patterns per trade to flag and explain exclusions.
4) **Bid risk scoring with explanations** — Approvers lack quick risk views; incumbents offer none. BidPilot scores coverage, deviation from spec, sub past performance, and missing alternates with transparent rationale.
5) **Agentic follow-ups / coverage optimization** — Coordinators manually chase missing scope. Incumbents focus on RFQ send, not interpretive follow-up. BidPilot auto-generates clarification questions and highlights coverage gaps by trade.
6) **Cross-project learning loops** — Lessons learned stay in spreadsheets. Incumbents are siloed per project. BidPilot accumulates scope/exclusion patterns, benchmarks, and sub quality signals over time.
7) **Audit-ready exports** — Execs need defensible records; manual bid tabs lack traceability. BidPilot exports structured, traceable comparisons into existing estimate templates and Procore/BuildingConnected.

## 6) Top 10 Must-Have User Stories

1) As an estimator, I can drag/drop or forward bid PDFs/emails, and the system auto-creates a structured bid entry without manual typing.
2) As an estimator, I can map extracted scope items to my CSI/WBS template, with suggestions learned from prior projects.
3) As a precon manager, I can see detected exclusions/assumptions for each bid with highlighted source text and confidence.
4) As an estimator, I can view a risk score per bid (coverage completeness, deviations, missing alternates) with explanations I can show leadership.
5) As a bid coordinator, I can see coverage status by trade (which scope items are unpriced/missing) and auto-generate clarification emails to subs.
6) As an estimator, I can compare bids side-by-side (leveled) and export them into my Excel bid tab or Procore/BuildingConnected estimate.
7) As a project executive, I can receive a summary package showing recommended award, key exclusions, and risk score with source evidence.
8) As an estimator, I can override or edit extracted scopes/exclusions, and the system learns from corrections for future bids.
9) As a coordinator, I can tag alternates/unit rates and ensure they are normalized across bids.
10) As a precon manager, I can track historical exclusion patterns and sub performance to inform invite lists and risk buffers.

## 7) 90-Day PMF Validation Plan

**Phase 0–30: Design Partners & Problem Fit**
- Goals: secure 3–5 mid-market GC design partners; validate top pain (bid leveling time/risk); gather 50+ real bid PDFs across 3–4 trades (MEP, envelope, interiors).
- Activities: founder-led discovery calls; manual redline of bids to define extraction schema; build email-ingestion prototype; baseline current cycle times and error rates.
- Artifacts: annotated bids; CSI mapping rules; exclusion taxonomy; current-state bid tab templates.
- Success metrics: 3+ signed design partner LOIs; dataset >50 proposals; partner agreement to pilot. Kill: <2 design partners or unwillingness to share real bids.

**Phase 31–60: MVP Build & Shadow Pilots**
- Goals: ship MVP (ingestion, normalization, exclusions, basic risk, Excel/Procore export); run shadow bid cycles on live projects without affecting award decisions.
- Activities: build trade-specific extraction models; connector to Excel template + CSV for Procore/BuildingConnected; UI for exclusions with source highlights; human-in-the-loop QA.
- Artifacts: working MVP; pilot playbook; accuracy dashboard (precision/recall on scope/exclusions); export templates.
- Success metrics: >70% exclusion detection precision, >60% recall; >50% reduction in leveling time in shadow test; exports accepted by estimators. Kill: accuracy below thresholds or exports rejected by users.

**Phase 61–90: Live Pilots & Pricing Proof**
- Goals: run 2–3 live bid cycles per partner; test pricing (\$1k–\$3k/estimator/mo) with conversion to paid annual; demonstrate ROI.
- Activities: enable opt-in agentic follow-ups; deliver exec-ready risk summaries; capture before/after metrics; negotiate pilot-to-paid agreements.
- Artifacts: pilot reports with time saved and change-order risk avoided; pricing one-pager; security/IT checklist.
- Success metrics: 2+ paying customers; NPS ≥30 among users; >80% trust in exclusions/risk scores; evidence of change-order avoidance or time savings worth >\$5k/month/team. Kill: no conversions or trust <60%.

## 8) Recommended Wedge + Positioning

- **Positioning (1 sentence):** “BidPilot turns messy subcontractor proposals into structured, leveled, and risk-scored bids that drop directly into your existing estimating workflow.”
- **ICP:** Mid-market general contractors (\$50–300M revenue) with 3–10 estimators handling frequent multi-trade bid days, currently using BuildingConnected/Procore + Excel bid tabs.
- **Integration strategy:** Email listener and drag/drop ingestion; exports to Excel bid tab templates; CSV/API push to Procore Estimating and BuildingConnected bid tabs; optional webhook to DESTINI/WinEst if available.
- **Pricing hypothesis:** Starter: \$1k/estimator/month (up to 3 trades, 2 projects/month); Pro: \$3k/estimator/month (all trades, cross-project learning, agentic follow-ups, security/SSO); pilots 60–90 days credited toward annual contracts.

