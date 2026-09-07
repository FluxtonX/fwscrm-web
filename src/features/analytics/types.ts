export interface DashboardOverview {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  leadsThisPeriod: number;
  leadsPreviousPeriod: number;
  leadsGrowthRate: number;
  totalImports: number;
  duplicateLeadsPrevented: number;
}

export interface PipelineStageItem {
  statusId: string | null;
  name: string;
  color: string;
  order: number;
  count: number;
  percentage: number;
}

export type StatusDistributionItem = PipelineStageItem;

export interface SourceDistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface TrendItem {
  date: string;
  label: string;
  count: number;
}

export interface TeamMemberPerformance {
  userId: string;
  name: string;
  email: string;
  assignedCount: number;
  wonCount: number;
  conversionRate: number;
}

export interface ActionItem {
  id: string;
  title: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  leadId?: string;
  leadName?: string;
}

export interface ActionItemsOverview {
  unassignedCount: number;
  uncontactedCount: number;
  staleCount: number;
  items: ActionItem[];
}

export interface RecentLeadItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  statusName?: string | null;
  statusColor?: string | null;
  sourceName?: string | null;
  ownerName?: string | null;
  createdAt: string;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface DashboardInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  text: string;
}

export interface DashboardPayload {
  overview: DashboardOverview;
  timeframe: string;
  pipeline: PipelineStageItem[];
  sources: SourceDistributionItem[];
  trends: TrendItem[];
  teamPerformance: TeamMemberPerformance[];
  actionItems: ActionItemsOverview;
  recentLeads: RecentLeadItem[];
  recentActivities: RecentActivityItem[];
  insights: DashboardInsight[];
}
