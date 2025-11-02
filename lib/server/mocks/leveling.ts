import type { LevelingMatrix } from "@/lib/server/leveling";

export const demoMatrix: LevelingMatrix = {
  tradeScopeId: "ts1",
  tradeScopeName: "Concrete",
  columns: [
    { id: "sub1", name: "Acme Concrete", status: "submitted", total: 124500 },
    { id: "sub2", name: "BlueRock Foundations", status: "invited", total: 135200 },
    { id: "sub3", name: "Crown Civil", status: "needs-clarification", total: 129800 }
  ],
  rows: [
    {
      id: "row1",
      normalizedKey: "mobilization",
      description: "Mobilization",
      csiCode: "03 01 10",
      category: "General Requirements",
      gap: false,
      overlap: false,
      lowConfidence: false,
      values: [
        { subcontractorId: "sub1", subcontractorName: "Acme Concrete", price: 8000 },
        { subcontractorId: "sub2", subcontractorName: "BlueRock Foundations", price: 8400 },
        { subcontractorId: "sub3", subcontractorName: "Crown Civil", price: 7900 }
      ]
    },
    {
      id: "row2",
      normalizedKey: "formwork",
      description: "Slab Formwork",
      csiCode: "03 10 00",
      category: "Forming",
      gap: false,
      overlap: true,
      lowConfidence: false,
      values: [
        { subcontractorId: "sub1", subcontractorName: "Acme Concrete", price: 42000 },
        { subcontractorId: "sub2", subcontractorName: "BlueRock Foundations", price: 41500 },
        { subcontractorId: "sub3", subcontractorName: "Crown Civil", price: null, notes: "Included in alternate" }
      ]
    },
    {
      id: "row3",
      normalizedKey: "rebar",
      description: "Reinforcing Steel",
      csiCode: "03 20 00",
      category: "Reinforcing",
      gap: true,
      overlap: false,
      lowConfidence: true,
      values: [
        { subcontractorId: "sub1", subcontractorName: "Acme Concrete", price: 31000 },
        { subcontractorId: "sub2", subcontractorName: "BlueRock Foundations", price: null },
        { subcontractorId: "sub3", subcontractorName: "Crown Civil", price: 32500 }
      ]
    }
  ],
  totals: {
    baseline: 129833,
    high: 135200,
    low: 124500
  }
};
