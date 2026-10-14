import type {EvidenceData} from './types.ts';

const hasArabicDigit = (value: string) => /[0-9]/.test(value);

export const validateEvidenceData = ({claims, sources}: EvidenceData): void => {
  for (const claim of Object.values(claims)) {
    if (hasArabicDigit(claim.display) && claim.sourceIds.length === 0) {
      throw new Error(`Claim ${claim.id} contains a numeric display but has no source IDs`);
    }

    for (const sourceId of claim.sourceIds) {
      if (!sources[sourceId]) {
        throw new Error(`Claim ${claim.id} references unknown source ${sourceId}`);
      }
    }
  }
};
