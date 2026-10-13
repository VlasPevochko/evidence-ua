// Evidence UA — scientific data contracts v1.0
// Seed package prepared 2026-10-10.
// Confidence values are provisional until scientific review is completed.

export type EvidenceConfidence =
  | "high"
  | "moderate"
  | "low"
  | "very_low"
  | "insufficient";

export type ClaimStatus =
  | "draft"
  | "evidence_review"
  | "scientifically_reviewed"
  | "published"
  | "update_required"
  | "retired";

export type ReviewStatus =
  | "pending"
  | "reviewed"
  | "scientifically_reviewed";

export type EvidenceLayer =
  | "human_outcome"
  | "mechanistic"
  | "mixed";

export type ClaimType =
  | "physiology"
  | "mechanism"
  | "efficacy"
  | "performance"
  | "safety"
  | "harm"
  | "association"
  | "nutrition";

export interface Claim {
  id: string;
  slug: string;
  statement: string;
  shortStatement: string;
  claimType: ClaimType;
  evidenceLayer: EvidenceLayer;
  domain: string;
  topics: string[];

  population: {
    description: string;
    notes?: string;
  };

  intervention?: {
    name: string;
    dose?: string;
    notes?: string;
  };

  comparator?: {
    description: string;
  };

  outcome: {
    name: string;
    timeframe?: "acute" | "short_term" | "medium_term" | "long_term" | "not_applicable";
    measurementNotes?: string;
  };

  evidenceConfidence: EvidenceConfidence;
  confidenceFramework: "evidenceua_grade_informed_v1" | "evidenceua_mechanism_v1";
  provisional: boolean;
  confidenceRationale: {
    summary: string;
    downgradeDomains?: string[];
    uncertaintyNotes?: string[];
  };

  evidenceSummary: string;
  practicalMeaning?: string;
  limitations: string[];

  applicability?: {
    directFor?: string[];
    uncertainFor?: string[];
    doNotExtrapolateTo?: string[];
  };

  explanations?: {
    simple?: string;
    university?: string;
    advanced?: string;
  };

  lastReviewed: string;
  nextReview?: string;
  version: string;
  status: ClaimStatus;
}

export interface Source {
  id: string;
  title: string;
  shortCitation: string;
  authors?: string[];
  studyId?: string;
  funding?: string;
  conflicts?: string;
  year: number;
  journal: string;

  publicationType:
    | "original_research"
    | "systematic_review"
    | "meta_analysis"
    | "systematic_review_meta_analysis"
    | "guideline"
    | "position_statement"
    | "other";

  studyDesign?: string;

  identifiers: {
    doi?: string;
    pmid?: string;
    pmcid?: string;
  };

  pubmedUrl?: string;
  publicationStatus?: "published" | "online_ahead_of_print" | "preprint";
  sourceStatus: "active" | "corrected" | "expression_of_concern" | "retracted" | "withdrawn" | "preprint";

  populationSummary?: string;
  methodsSummary?: string;
  keyLimitations?: string[];

  lastChecked: string;
}

export interface EvidenceRecord {
  id: string;
  sourceId: string;
  claimId: string;

  evidenceLayer: EvidenceLayer;

  outcome: {
    name: string;
    specificMeasure?: string;
    timepoint?: string;
  };

  result?: {
    effectMeasure?: string;
    estimate?: number;
    lowerCI?: number;
    upperCI?: number;
    confidenceLevel?: number;
    pValue?: number;
    unit?: string;
    heterogeneityI2?: number;
    summary?: string;
  };

  direction:
    | "supports_claim"
    | "neutral"
    | "conflicts_with_claim"
    | "mixed"
    | "unclear";

  relevance:
    | "direct"
    | "partially_direct"
    | "indirect";

  roleForClaim:
    | "primary_support"
    | "supporting"
    | "conflicting"
    | "neutral"
    | "mechanistic_support"
    | "safety_signal"
    | "context_only";

  interpretation?: string;
  extractionNotes?: string[];
  reviewStatus: ReviewStatus;
  populationContext?: string;
  interventionContext?: string;
  comparatorContext?: string;
  riskOfBias?: { status: "not_assessed" | "assessed"; summary?: string };
  extractionLocation?: { section?: string; table?: string; figure?: string; page?: string; quote?: string; checkedAt?: string };
  sampleSize?: number;
  studyCount?: number;
}

export type ConfidenceDomain = "risk_of_bias" | "inconsistency" | "indirectness" | "imprecision" | "publication_bias";
export interface ConfidenceAssessment {
  id: string; claimId: string; claimVersion: string;
  framework: Claim['confidenceFramework'];
  status: "draft" | "ready_for_review";
  proposedConfidence: EvidenceConfidence;
  evidenceRecordIds: string[];
  rationale: string;
  domains: Record<ConfidenceDomain,{status:"not_assessed"|"assessed";rationale:string}>;
  createdAt: string; origin: string;
}
export interface ScientificReview {
  id: string; claimId: string; assessmentId: string;
  status: "pending" | "approved" | "changes_requested";
  approverId: string|null; approvedAt: string|null; reason: string|null;
  history: {at:string;event:string;actorRole:string;note:string}[];
}

export interface ModuleSection {
  id: string;
  anchorId?: string;
  navLabel?: string;
  sourceIds?: string[];
  type:
    | "hero"
    | "short_answer"
    | "mechanism"
    | "evidence_grid"
    | "dosing"
    | "kidney"
    | "myths"
    | "sources"
    | "last_reviewed";
  title?: string;
  claimIds?: string[];
}

export interface EvidenceModule {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: "draft" | "ready_for_implementation" | "published";
  version: string;
  lastReviewed: string;
  evidenceStatus: "up_to_date" | "new_evidence_detected" | "reviewing" | "update_required" | "updated";
  sections: ModuleSection[];
}
