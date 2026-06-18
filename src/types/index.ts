export type {
  User,
  ActivityLog,
  Badge,
  UserBadge,
  AiInsight,
  QuizResponse
} from '@prisma/client';

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
