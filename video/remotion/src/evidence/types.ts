export type EvidenceSource = {
  id: string;
  shortLabel: string;
  title: string;
  pmid?: string;
  doi?: string;
  url?: string;
};

export type EvidenceClaim = {
  id: string;
  display: string;
  meaning: string;
  qualifier?: string;
  sourceIds: string[];
};

export type EvidenceData = {
  claims: Record<string, EvidenceClaim>;
  sources: Record<string, EvidenceSource>;
};
