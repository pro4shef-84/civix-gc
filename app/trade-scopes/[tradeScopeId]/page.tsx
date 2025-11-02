import { notFound } from "next/navigation";

import { getTradeScope } from "@/lib/server/trade-scopes";
import { getLevelingMatrix } from "@/lib/server/leveling";
import { listInvitations } from "@/lib/server/rfq";
import { Tabs } from "@/components/ui/tabs";
import { TradeScopeHeader } from "@/components/trade-scope/trade-scope-header";
import { BidsPanel } from "@/components/trade-scope/bids-panel";
import { LevelingMatrixView } from "@/components/leveling/leveling-matrix-view";
import { RfqTracker } from "@/components/rfq/rfq-tracker";
import { RfiPanel } from "@/components/trade-scope/rfi-panel";
import { ExportPanel } from "@/components/trade-scope/export-panel";

export const dynamic = "force-dynamic";

const tabs = [
  { id: "bids", label: "Bids" },
  { id: "leveling", label: "Leveling" },
  { id: "rfq", label: "RFQ Tracker" },
  { id: "rfi", label: "RFIs" },
  { id: "export", label: "Export" }
];

export default async function TradeScopePage({
  params
}: {
  params: { tradeScopeId: string };
}) {
  const tradeScope = await getTradeScope(params.tradeScopeId);

  if (!tradeScope) {
    notFound();
  }

  const [matrix, invitations] = await Promise.all([
    getLevelingMatrix(tradeScope.id),
    listInvitations(tradeScope.id)
  ]);

  return (
    <div className="space-y-8">
      <TradeScopeHeader tradeScope={tradeScope} />
      <Tabs tabs={tabs}>
        <Tabs.Panel id="bids">
          <BidsPanel tradeScopeId={tradeScope.id} />
        </Tabs.Panel>
        <Tabs.Panel id="leveling">
          <LevelingMatrixView matrix={matrix} />
        </Tabs.Panel>
        <Tabs.Panel id="rfq">
          <RfqTracker tradeScopeId={tradeScope.id} invitations={invitations} />
        </Tabs.Panel>
        <Tabs.Panel id="rfi">
          <RfiPanel tradeScopeId={tradeScope.id} />
        </Tabs.Panel>
        <Tabs.Panel id="export">
          <ExportPanel tradeScope={tradeScope} matrix={matrix} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
