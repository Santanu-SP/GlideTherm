import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ShiftPlan } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');
const STORAGE_FILE = path.join(DATA_DIR, 'saved-plans.json');

export class StorageService {
  private static ensureStorageDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, '[]', 'utf-8');
    }
  }

  public static getSavedPlans(): ShiftPlan[] {
    try {
      this.ensureStorageDir();
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Error reading saved plans:', err);
      return [];
    }
  }

  public static getSavedPlanById(id: string): ShiftPlan | null {
    const plans = this.getSavedPlans();
    return plans.find(p => p.id === id) || null;
  }

  public static savePlan(plan: ShiftPlan): ShiftPlan {
    this.ensureStorageDir();
    const plans = this.getSavedPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);

    if (existingIndex >= 0) {
      plans[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      plans.unshift({ ...plan, updatedAt: new Date().toISOString() });
    }

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(plans, null, 2), 'utf-8');
    return plan;
  }

  public static deletePlan(id: string): boolean {
    this.ensureStorageDir();
    const plans = this.getSavedPlans();
    const filtered = plans.filter(p => p.id !== id);
    if (filtered.length !== plans.length) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  }

  public static resetTestStorage(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, '[]', 'utf-8');
  }
}
