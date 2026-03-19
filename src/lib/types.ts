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
