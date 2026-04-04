export interface Video {
	id: string;
	title: string;
	description: string;
	sourceUrl: string;
	sourceVideoUrl?: string; // full source video for clip editing (Vercel Blob / static)
	thumbnail?: string;
	duration?: string;
	durationSeconds?: number;
	tags: string[];
	createdAt: string;
	status: 'review' | 'approved' | 'rejected' | 'posted';
	analysis: VideoAnalysis;
	clips: Clip[];
}

export interface VideoAnalysis {
	summary: string;
	scorecard: {
		communication: number;
		deescalation: number;
		useOfForce: number;
		legalKnowledge: number;
		bodycamCompliance: number;
		overall: number;
	};
	teachableMoments: TeachableMoment[];
	postDrafts: PostDraft[];
}

export interface Clip {
	id: string;
	title: string;
	description: string;
	assessment: string;
	timestamp: string; // display string e.g. "00:30-00:45"
	startSeconds: number;
	endSeconds: number;
	rating: number;
	url: string;
	status?: 'pending' | 'accepted' | 'rejected';
}

export interface ClipEdit {
	clipId: string;
	originalStart: number;
	originalEnd: number;
	newStart: number;
	newEnd: number;
	notes: string;
	submitted: boolean;
}

export interface TeachableMoment {
	title: string;
	content: string;
}

export interface PostDraft {
	id: string;
	hook: string;
	hashtags: string[];
	platform: string;
}

export interface VideoReviewState {
	videoId: string;
	videoStatus: 'review' | 'approved' | 'rejected' | 'posted';
	clipStatuses: Record<string, 'pending' | 'accepted' | 'rejected'>;
	clipEdits: Record<string, ClipEdit>;
	updatedAt: string;
}

/** Self-contained payload for downstream post-creation agent */
export interface VideoExport {
	videoId: string;
	title: string;
	description: string;
	sourceUrl: string;
	sourceVideoUrl?: string;
	duration?: string;
	durationSeconds?: number;
	tags: string[];
	summary: string;
	scorecard: VideoAnalysis['scorecard'];
	clips: ExportClip[];
	teachableMoments: TeachableMoment[];
	postDrafts: PostDraft[];
	status: 'queued' | 'processing' | 'posted' | 'failed';
	publishedAt: string;
	updatedAt: string;
}

// ── Journal ────────────────────────────────────────────────────────────────

export interface JournalEntry {
	entryId: string;
	threadId: string;
	author: 'david' | 'claw';
	content: string;
	topics: JournalTopicRef[];
	createdAt: string;
}

export interface JournalTopicRef {
	topicId: string;
	name: string;
	confidence: number;
}

export interface JournalTopic {
	topicId: string;
	name: string;
	description: string;
	color: string;
	entryCount: number;
	latestEntryAt: string;
}

// ── Gateway ───────────────────────────────────────────────────────────────

export interface GatewayCronJob {
	id: string;
	agentId: string;
	sessionKey: string;
	name: string;
	enabled: boolean;
	createdAtMs: number;
	updatedAtMs: number;
	schedule: {
		kind: string;
		expr: string;
		tz: string;
		staggerMs?: number;
	};
	sessionTarget: string;
	wakeMode: string;
	payload: {
		kind: string;
		message: string;
		model?: string;
		timeoutSeconds?: number;
	};
	delivery: {
		mode: string;
		channel?: string;
		channelId?: string;
	};
	state: GatewayCronJobState;
}

export interface GatewayCronJobState {
	nextRunAtMs: number;
	lastRunAtMs: number;
	lastRunStatus: string;
	lastDurationMs: number;
	lastDeliveryStatus: string;
	consecutiveErrors: number;
	lastError?: string | null;
}

export interface GatewayCronRun {
	ts: number;
	jobId: string;
	action: string;
	status: string;
	summary?: string;
	error?: string;
	durationMs: number;
	deliveryStatus?: string;
	sessionId?: string;
	model?: string;
	provider?: string;
	usage?: {
		input_tokens: number;
		output_tokens: number;
		total_tokens?: number;
	};
}

export interface GatewaySession {
	sessionKey: string;
	sessionId: string;
	updatedAt: number;
	chatType?: string;
	channel?: string;
	origin?: {
		label?: string;
		provider?: string;
	};
	deliveryContext?: {
		to?: string;
		channel?: string;
		channelId?: string;
	};
	model?: string;
	contextTokens?: number;
	inputTokens?: number;
	outputTokens?: number;
}

export interface GatewayHeartbeatConfig {
	every: string;
	model?: string;
}

// ── Gateway Usage ────────────────────────────────────────────────────────

export interface GatewayUsageTotals {
	allTime: number;
	last7d: number;
	last30d: number;
	totalMessages: number;
}

export interface GatewayDailyUsage {
	date: string;
	cost: number;
	messages: number;
	inputTokens: number;
	outputTokens: number;
}

export interface GatewayChannelUsage {
	channelId: string;
	name: string;
	cost: number;
	messages: number;
}

export interface GatewayDailyChannelUsage {
	date: string;
	channelId: string;
	name: string;
	cost: number;
	messages: number;
}

export interface GatewayModelUsage {
	model: string;
	cost: number;
	messages: number;
}

export interface GatewayUsageData {
	generatedAt: string;
	totals: GatewayUsageTotals;
	daily: GatewayDailyUsage[];
	channels: GatewayChannelUsage[];
	dailyByChannel: GatewayDailyChannelUsage[];
	models: GatewayModelUsage[];
}

/** Clip with edits already applied — ready for downstream use */
export interface ExportClip {
	id: string;
	title: string;
	description: string;
	assessment: string;
	timestamp: string;
	startSeconds: number;
	endSeconds: number;
	rating: number;
	url: string;
	editNotes?: string;
	wasEdited: boolean;
}
