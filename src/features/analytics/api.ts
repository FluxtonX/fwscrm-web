import { apiClient } from '@/lib/api/client';
import {
  DashboardPayload,
  DashboardOverview,
  StatusDistributionItem,
  SourceDistributionItem,
  RecentActivityItem,
} from './types';

export async function fetchDashboard(timeframe = '30d'): Promise<DashboardPayload> {
  return apiClient<DashboardPayload>(`/analytics/dashboard?timeframe=${timeframe}`);
}

export async function fetchAnalyticsOverview(): Promise<DashboardOverview> {
  return apiClient<DashboardOverview>('/analytics/overview');
}

export async function fetchStatusDistribution(): Promise<StatusDistributionItem[]> {
  return apiClient<StatusDistributionItem[]>('/analytics/status-distribution');
}

export async function fetchSourceDistribution(): Promise<SourceDistributionItem[]> {
  return apiClient<SourceDistributionItem[]>('/analytics/source-distribution');
}

export async function fetchRecentActivities(limit = 10): Promise<RecentActivityItem[]> {
  return apiClient<RecentActivityItem[]>(`/activities/recent?limit=${limit}`);
}
