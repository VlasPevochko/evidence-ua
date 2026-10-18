import { contentCatalog } from './schema.mjs';

export function loadContentCatalog() {
  return contentCatalog.map((module) => ({
    ...module,
    id: module.slug,
    kind: 'module'
  }));
}
