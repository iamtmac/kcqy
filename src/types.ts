export interface Enterprise {
  id: string;
  name: string;
  district: string;
  industry: string;
  capital: number;
  establishedDate: string;
  isIndependent: boolean;
  status: string;
  scope: string;
  ipCount: number;
  hasPreviousRecords: boolean;
  contact: string;
  statusTracking: string;
  score: number;
  grade: string;
  reasons: string[];
  shortfalls: string[];
}

export interface Stats {
  total: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  ineligible: number;
  byDistrict: { name: string; count: number }[];
}
