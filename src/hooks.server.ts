import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('Incoming request:', {
		url: event.url.toString(),
		pathname: event.url.pathname,
		method: event.request.method,
		host: event.request.headers.get('host'),
		origin: event.request.headers.get('origin'),
		headers: Object.fromEntries(event.request.headers)
	});

	const response = await resolve(event);
	return response;
};
