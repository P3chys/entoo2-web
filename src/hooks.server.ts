import type { Handle } from '@sveltejs/kit';

const BLOCKED_PATH_PREFIXES = [
	'/wp-',
	'/_ignition',
	'/webhook/',
	'/cgi-bin/',
	'/vendor/',
	'/debug/',
	'/.env',
	'/.git',
	'/phpMyAdmin',
	'/phpmyadmin',
	'/administrator/',
	'/wp-admin',
	'/wp-login',
	'/xmlrpc.php'
];

const BLOCKED_PATH_SUFFIXES = ['.php', '.asp', '.aspx', '.jsp', '.cgi'];

function isBlockedPath(pathname: string): boolean {
	const lower = pathname.toLowerCase();
	if (BLOCKED_PATH_PREFIXES.some((prefix) => lower.startsWith(prefix))) return true;
	if (BLOCKED_PATH_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return true;
	return false;
}

const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-XSS-Protection': '1; mode=block',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const method = event.request.method;

	// Block known vulnerability scanner paths
	if (isBlockedPath(pathname)) {
		return new Response('Forbidden', {
			status: 403,
			headers: { 'Content-Type': 'text/plain' }
		});
	}

	// Redirect /favicon.ico to /favicon.png for bots that hardcode .ico
	if (pathname === '/favicon.ico') {
		return new Response(null, {
			status: 301,
			headers: { Location: '/favicon.png' }
		});
	}

	const start = performance.now();
	const response = await resolve(event);
	const duration = Math.round(performance.now() - start);

	// Lightweight request logging (no headers, no sensitive data)
	if (response.status >= 400) {
		console.warn(`[${response.status}] ${method} ${pathname} (${duration}ms)`);
	}

	// Add security headers to all responses
	const securedResponse = new Response(response.body, response);
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		securedResponse.headers.set(key, value);
	}

	return securedResponse;
};
