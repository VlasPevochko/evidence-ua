export type VisualAsset = {
  id: string;
  kind: 'image' | 'video' | 'lottie' | 'model3d' | 'audio';
  file: string;
  provenance: string;
  usageRights: string;
  approved: boolean;
};
export type Insert = {
  id: string;
  fromSeconds: number;
  durationSeconds: number;
  assetId: string;
  layout: 'full' | 'split50' | 'overlay';
  approved: boolean;
};
export type EditPlan = {
  id: string;
  durationSeconds: number;
  assets: VisualAsset[];
  inserts: Insert[];
};

// Offline files and explicit approval make the approved edit reproducible.
export function validateEditPlan(plan: EditPlan): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(plan.durationSeconds) || plan.durationSeconds <= 0) errors.push('Invalid duration');
  const assets = new Map<string, VisualAsset>();
  for (const asset of plan.assets) {
    if (!asset.id || assets.has(asset.id)) errors.push(`Duplicate or empty asset: ${asset.id}`);
    assets.set(asset.id, asset);
    if (!asset.file || /^(?:[a-z]+:|[\\/])/i.test(asset.file) || asset.file.split(/[\\/]/).includes('..')) errors.push(`Asset must use a local public-relative file: ${asset.id}`);
    if (!asset.provenance.trim() || !asset.usageRights.trim()) errors.push(`Missing provenance or usage rights: ${asset.id}`);
    if (!asset.approved) errors.push(`Asset not approved: ${asset.id}`);
  }
  const ids = new Set<string>();
  for (const insert of plan.inserts) {
    if (!insert.id || ids.has(insert.id)) errors.push(`Duplicate or empty insert: ${insert.id}`);
    ids.add(insert.id);
    if (!assets.has(insert.assetId)) errors.push(`Missing asset: ${insert.assetId}`);
    if (!Number.isFinite(insert.fromSeconds) || !Number.isFinite(insert.durationSeconds) || insert.fromSeconds < 0 || insert.durationSeconds <= 0 || insert.fromSeconds + insert.durationSeconds > plan.durationSeconds) errors.push(`Insert outside timeline: ${insert.id}`);
    if (!insert.approved) errors.push(`Insert not approved: ${insert.id}`);
  }
  return errors;
}
