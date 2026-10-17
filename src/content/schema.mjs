export const requiredModuleFields = ['slug', 'title', 'route', 'status', 'source'];

export const contentCatalog = [
  {
    slug: 'evidence',
    title: 'Evidence',
    route: '/evidence',
    status: 'active',
    source: 'src/evidence',
    confidence: 'not assessed',
    section: 'knowledge'
  },
  {
    slug: 'nutrition',
    title: 'Nutrition',
    route: '/nutrition',
    status: 'active',
    source: 'src/evidence/nutrition',
    confidence: 'not assessed',
    section: 'knowledge'
  },
  {
    slug: 'cell-lab',
    title: 'Cell Lab',
    route: '/cell-lab',
    status: 'active',
    source: 'src/cell-lab',
    confidence: 'not assessed',
    section: 'experiments'
  },
  {
    slug: 'muscle-lab',
    title: 'Muscle Lab',
    route: '/muscle-lab',
    status: 'active',
    source: 'src/muscle-lab',
    confidence: 'not assessed',
    section: 'experiments'
  },
  {
    slug: 'platform',
    title: 'Platform',
    route: '/platform',
    status: 'active',
    source: 'src/platform',
    confidence: 'not assessed',
    section: 'directory'
  }
];

export function validateModuleShape(module) {
  const errors = [];

  for (const field of requiredModuleFields) {
    if (!module?.[field] || String(module[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (module?.route && !module.route.startsWith('/')) {
    errors.push(`Route must start with '/': ${module.route}`);
  }

  if (module?.status && !['draft', 'active', 'archived'].includes(module.status)) {
    errors.push(`Unsupported status: ${module.status}`);
  }

  if (module?.section && !['knowledge', 'experiments', 'directory'].includes(module.section)) {
    errors.push(`Unsupported section: ${module.section}`);
  }

  return errors;
}
