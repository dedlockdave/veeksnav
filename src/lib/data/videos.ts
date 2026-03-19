import type { Video } from '$lib/types';

export const videos: Video[] = [
	{
		id: 'HZrxIUNNAWI',
		title: 'Woman & Cop Argue Over Hacked Snapchat',
		description:
			'Dispute over alleged online harassment and identity theft escalates to arrests for obstruction and battery on LEO.',
		sourceUrl: 'https://www.youtube.com/watch?v=HZrxIUNNAWI',
		sourceVideoUrl: '/videos/HZrxIUNNAWI/source.mp4', // will be Vercel Blob URL once wired
		duration: '14:57',
		durationSeconds: 897,
		tags: ['use-of-force', 'obstruction', 'battery-on-leo', 'de-escalation', 'excited-utterance'],
		createdAt: '2026-03-18',
		status: 'review',
		analysis: {
			summary:
				'Police responded to a dispute between two women regarding alleged online harassment and identity theft. The situation escalated when the reporting party and her male companion confronted the officer, refusing to comply with commands to leave, leading to their arrest for obstruction and battery on a law enforcement officer.',
			scorecard: {
				communication: 7,
				deescalation: 6,
				useOfForce: 8,
				legalKnowledge: 9,
				bodycamCompliance: 7,
				overall: 7
			},
			teachableMoments: [
				{
					title: 'The Power of an Excited Utterance',
					content:
						"In stressful situations, people often blurt out truths before they've had time to formulate a deceptive story. This \"excited utterance\" can be powerful evidence in court. For law enforcement, recognizing and documenting these spontaneous statements is crucial. For citizens, it's a reminder that anything said under stress can be used as evidence."
				},
				{
					title: 'De-escalation is a Two-Way Street',
					content:
						'While officers are trained in de-escalation techniques, their effectiveness relies heavily on the willingness of individuals to comply and engage constructively. When individuals refuse to listen, follow commands, or actively escalate the situation, de-escalation becomes extremely challenging, and officers may need to transition to enforcement actions.'
				},
				{
					title: 'Understanding Obstruction and Lawful Orders',
					content:
						'Law enforcement officers have the authority to issue lawful commands to maintain public order and safety. Refusing to comply with these commands, especially when repeatedly given, can constitute obstruction of justice. Understanding these boundaries is critical for both officers and citizens.'
				}
			],
			postDrafts: [
				{
					id: 'draft1',
					hook: "This bodycam footage shows a chaotic scene where a verbal dispute quickly escalates. Watch how one individual's \"excited utterance\" immediately reveals key information, and how the officer attempts to de-escalate a highly emotional situation. What would you do in this scenario?",
					hashtags: ['PoliceInteractions', 'DeEscalation', 'LawEnforcement'],
					platform: 'all'
				},
				{
					id: 'draft2',
					hook: 'When emotions run high, things can get out of control fast. This video highlights the challenges officers face when individuals refuse to comply with lawful orders and actively escalate a situation. Learn why cooperation is key and how non-compliance can lead to serious charges.',
					hashtags: ['PublicSafety', 'KnowYourRights', 'OfficerChallenges'],
					platform: 'all'
				},
				{
					id: 'draft3',
					hook: 'Ever wonder about the legal implications of what you say or do during a police encounter? This incident demonstrates how spontaneous admissions and active resistance can impact a case. We break down the teachable moments on communication, de-escalation, and the consequences of obstructing an officer.',
					hashtags: ['PoliceTraining', 'LegalLessons', 'CommunityPolicing'],
					platform: 'all'
				}
			]
		},
		clips: [
			{
				id: 'clip1-excited-utterance',
				title: 'Excited Utterance Admission',
				description: 'Woman admits to changing Facebook password before crafting a story',
				assessment:
					'Clear excited utterance — direct admission contradicting later claims of innocence. Powerful evidence.',
				timestamp: '00:30-00:45',
				startSeconds: 30,
				endSeconds: 45,
				rating: 5,
				url: '/videos/HZrxIUNNAWI/clip1_excited_utterance.mp4'
			},
			{
				id: 'clip2-proof-attempt',
				title: "Suspect Tries to Show 'Proof'",
				description:
					"Woman attempts to show nudes on phone as evidence despite officer's refusal",
				assessment:
					'Highlights emotional/irrational state. Officer blocks bodycam view — debatable call on transparency.',
				timestamp: '03:50-04:10',
				startSeconds: 230,
				endSeconds: 250,
				rating: 5,
				url: '/videos/HZrxIUNNAWI/clip2_proof_attempt.mp4'
			},
			{
				id: 'clip3-spit-arrest',
				title: 'Spitting & Immediate Arrest',
				description:
					'Woman spits at officer triggering immediate arrest for battery on LEO',
				assessment:
					'Clear-cut battery on law enforcement officer. Immediate arrest fully justified.',
				timestamp: '09:38-10:05',
				startSeconds: 578,
				endSeconds: 605,
				rating: 5,
				url: '/videos/HZrxIUNNAWI/clip3_spit_arrest.mp4'
			},
			{
				id: 'clip4-bodycam-deactivation',
				title: 'Bodycam Deactivated Mid-Confrontation',
				description:
					'Officer turns off bodycam during escalation, reactivates when subjects approach again',
				assessment:
					'Significant transparency concern. Deactivating during escalation raises accountability questions.',
				timestamp: '04:20-05:00',
				startSeconds: 260,
				endSeconds: 300,
				rating: 4,
				url: '/videos/HZrxIUNNAWI/clip4_disengage_bodycam.mp4'
			},
			{
				id: 'clip5-arrest-resistance',
				title: 'Physical Arrest & Active Resistance',
				description:
					"Subject actively resists arrest while claiming 'I'm not doing anything'",
				assessment:
					'Textbook active resistance. Verbal claims of compliance contradicted by physical actions.',
				timestamp: '07:50-08:35',
				startSeconds: 470,
				endSeconds: 515,
				rating: 4,
				url: '/videos/HZrxIUNNAWI/clip5_arrest_resistance.mp4'
			}
		]
	}
];
