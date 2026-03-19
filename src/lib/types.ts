export interface Video {
	id: string;
	title: string;
	description: string;
	sourceUrl: string;
	thumbnail?: string;
	duration?: string;
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
	timestamp: string;
	rating: number;
	url: string;
	status?: 'pending' | 'accepted' | 'rejected';
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
