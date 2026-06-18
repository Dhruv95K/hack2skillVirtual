export interface User {
  id: string;
  email: string;
  name: string;
  streak: number;
  level: number;
  totalCo2Saved: number;
  lastLoggedAt?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  category: 'transport' | 'food' | 'energy';
  subType: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  loggedAt: string;
}

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  thresholdType: string;
  thresholdValue: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}

export interface AiInsight {
  id: string;
  userId: string;
  content: string;
  generatedAt: string;
}

export interface OffsetProgram {
  name: string;
  description: string;
  url: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface AiTip {
  title: string;
  description: string;
  estimatedSavingKg: number;
  category: 'transport' | 'food' | 'energy';
}
