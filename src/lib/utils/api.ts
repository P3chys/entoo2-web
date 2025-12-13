import { browser } from '$app/environment';
import type { ApiError } from '$types';

const API_URL = browser ? window.location.origin : 'http://localhost:8080';

export class ApiClient {
	private baseUrl: string;
	private token: string | null = null;

	constructor(baseUrl: string = API_URL) {
		this.baseUrl = baseUrl;
		if (browser) {
			this.token = localStorage.getItem('access_token');
		}
	}

	setToken(token: string | null) {
		this.token = token;
		if (browser) {
			if (token) {
				localStorage.setItem('access_token', token);
			} else {
				localStorage.removeItem('access_token');
			}
		}
	}

	getToken(): string | null {
		return this.token;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<{ data?: T; error?: ApiError }> {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				...options,
				headers
			});

			const text = await response.text();
			let data;
			try {
				data = text ? JSON.parse(text) : {};
			} catch (e) {
				return {
					error: {
						error: 'API Error',
						message: text || `Server returned ${response.status}`,
						status: response.status
					}
				};
			}

			if (!response.ok) {
				return {
					error: {
						error: data.error || 'Unknown error',
						message: data.message || data.error || 'An error occurred',
						status: response.status
					}
				};
			}

			return { data };
		} catch (error) {
			return {
				error: {
					error: 'Network error',
					message: error instanceof Error ? error.message : 'Network error occurred',
					status: 0
				}
			};
		}
	}

	async get<T>(endpoint: string): Promise<{ data?: T; error?: ApiError }> {
		return this.request<T>(endpoint, { method: 'GET' });
	}

	async post<T>(endpoint: string, body?: unknown): Promise<{ data?: T; error?: ApiError }> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	async put<T>(endpoint: string, body?: unknown): Promise<{ data?: T; error?: ApiError }> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined
		});
	}

	async delete<T>(endpoint: string): Promise<{ data?: T; error?: ApiError }> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}

	async upload<T>(
		endpoint: string,
		file: File,
		additionalData?: Record<string, string>
	): Promise<{ data?: T; error?: ApiError }> {
		const formData = new FormData();
		formData.append('file', file);

		if (additionalData) {
			Object.entries(additionalData).forEach(([key, value]) => {
				formData.append(key, value);
			});
		}

		const headers: HeadersInit = {};
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST',
				headers,
				body: formData
			});

			const data = await response.json();

			if (!response.ok) {
				return {
					error: {
						error: data.error || 'Unknown error',
						message: data.message || 'An error occurred',
						status: response.status
					}
				};
			}

			return { data };
		} catch (error) {
			return {
				error: {
					error: 'Network error',
					message: error instanceof Error ? error.message : 'Network error occurred',
					status: 0
				}
			};
		}
	}
}

export const api = new ApiClient();
