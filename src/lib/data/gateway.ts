import type { GatewayCronJob, GatewaySession, GatewayHeartbeatConfig } from '$lib/types';
import jobsData from './gateway/jobs.json';
import sessionsData from './gateway/sessions.json';
import configData from './gateway/config.json';

export const jobs: GatewayCronJob[] = jobsData as GatewayCronJob[];

const sd = sessionsData as unknown as { total: number; recentlyActive: number; sessions: GatewaySession[] };
export const sessions: GatewaySession[] = sd.sessions;
export const sessionTotal: number = sd.total;
export const sessionRecentlyActive: number = sd.recentlyActive;

export const heartbeat: GatewayHeartbeatConfig = configData.heartbeat as GatewayHeartbeatConfig;
export const primaryModel: string = configData.primaryModel;
export const syncedAt: string = configData.syncedAt;
