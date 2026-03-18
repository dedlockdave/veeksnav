export interface Video {
	id: string;
	title: string;
	description: string;
	url: string;
	thumbnail?: string;
	duration?: string;
	tags: string[];
	createdAt: string;
}
