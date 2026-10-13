import type { EvidenceModule } from "./types";

export const creatineModule: EvidenceModule = {
  id: "MOD-CREATINE-001",
  slug: "creatine",
  title: "Креатин",
  subtitle:
    "Одна з найбільш досліджених спортивних добавок — без маркетингових перебільшень.",
  status: "ready_for_implementation",
  version: "1.0",
  lastReviewed: "2026-10-10",
  evidenceStatus: "reviewing",
  sections: [
    {
      id: "hero",
      type: "hero",
      title: "Креатин"
    },
    {
      id: "short-answer",
      type: "short_answer",
      title: "Коротко",
      claimIds: ["CLM-000001", "CLM-000002", "CLM-000006", "CLM-000007", "CLM-000004"]
    },
    {
      id: "mechanism",
      type: "mechanism",
      title: "Як працює система креатин — фосфокреатин — ATP"
    },
    {
      id: "evidence-grid",
      type: "evidence_grid",
      title: "Що показують дані",
      claimIds: [
        "CLM-000001",
        "CLM-000002",
        "CLM-000003",
        "CLM-000004",
        "CLM-000005",
        "CLM-000006",
        "CLM-000007",
        "CLM-000008"
      ]
    },
    {
      id: "dosing",
      type: "dosing",
      title: "Як приймати",
      claimIds: ["CLM-000006", "CLM-000007"]
    },
    {
      id: "kidney",
      type: "kidney",
      title: "Креатин, креатинін і нирки",
      claimIds: ["CLM-000003", "CLM-000004"]
    },
    {
      id: "myths",
      type: "myths",
      title: "Міфи",
      claimIds: ["CLM-000003", "CLM-000005", "CLM-000006", "CLM-000007", "CLM-000008"]
    },
    {
      id: "sources",
      type: "sources",
      sourceIds: ["SRC-000001", "SRC-000002", "SRC-000003", "SRC-000004", "SRC-000005", "SRC-000006", "SRC-000007", "SRC-000008", "SRC-000009", "SRC-000010", "SRC-000011"],
      title: "Джерела"
    },
    {
      id: "last-reviewed",
      type: "last_reviewed",
      title: "Актуальність"
    }
  ]
};
