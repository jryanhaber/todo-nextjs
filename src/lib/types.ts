// lib/types.ts
export interface WorkflowItem {
  id: number;
  type: 'todo' | 'inprogress' | 'waiting' | 'completed';
  text: string;
  url: string;
  title: string;
  screenshot: string;
  tags: string[];
  systemTags: string[];
  gtdStage: GtdStage;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  waitingFor?: string;
  waitingUntil?: string;
  metadata?: Record<string, any>;
}

export type GtdStage =
  | 'inbox'
  | 'actionable'
  | 'next-actions'
  | 'waiting-for'
  | 'someday'
  | 'reference'
  | 'completed';

export interface ItemFilters {
  type?: 'todo' | 'inprogress' | 'waiting' | 'completed';
  gtdStage?: GtdStage;
  tag?: string;
}

export interface GtdCounts {
  inbox: number;
  'next-actions': number;
  'waiting-for': number;
  someday: number;
  reference: number;
  completed: number;
}

export type ViewMode = 'card' | 'list';

export type ItemAction = 'open' | 'edit' | 'delete' | 'process';

export interface EventCallback<T = any> {
  (data: T): void;
}

export interface EventMap {
  'items-changed': WorkflowItem[];
  'item-saved': WorkflowItem;
  'item-deleted': number;
}
