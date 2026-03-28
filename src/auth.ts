import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { env } from '$env/dynamic/private';

const allowedEmails = (env.ALLOWED_EMAILS ?? '')
	.split(',')
	.map((e) => e.trim().toLowerCase())
	.filter(Boolean);

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [Google],
	trustHost: true,
	callbacks: {
		signIn({ profile }) {
			const email = profile?.email?.toLowerCase() ?? '';
			if (allowedEmails.length === 0) return true;
			return allowedEmails.includes(email);
		},
		session({ session }) {
			return session;
		}
	}
});
