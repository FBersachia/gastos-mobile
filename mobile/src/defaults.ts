import { createMay2026SampleData } from './sampleData';
import { AppData } from './types';

export const createDefaultData = (): AppData => {
  const sample = createMay2026SampleData();

  // Production defaults use the demo fixture only as the catalog source.
  // User-facing first-run data must not include demo transactions or budgets.
  return { ...sample, transactions: [], budgets: [] };
};
