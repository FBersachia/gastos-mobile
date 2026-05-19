import { createMay2026SampleData } from './sampleData';
import { AppData } from './types';

export const createDefaultData = (): AppData => {
  const sample = createMay2026SampleData();
  return { ...sample, transactions: [], budgets: [] };
};
