import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ApiError, SearchResponse, SearchFilters } from '$types';

// Use PUBLIC_API_URL if set, otherwise use current origin (for relative URLs)
// Safeguard: Strip /api/v1 from the end if it's there to prevent double pathing
const rawApiUrl = env.PUBLIC_API_URL || (browser ? window.location.origin : '');
const API_URL = rawApiUrl.replace(/\/api\/v1\/?$/, '');

if (browser) {
	console.log('ApiClient: [VER-3] Initialized');
	console.log(' - Raw URL from env:', rawApiUrl);
	console.log(' - Cleaned API_URL:', API_URL);
}

export class ApiClient {
	private baseUrl: string;
	private token: string | null = null;
	private isRefreshing: boolean = false;
	private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
	private readonly UPLOAD_TIMEOUT = 120000; // 2 minutes for file uploads

	constructor(baseUrl: string = API_URL) {
		this.baseUrl = baseUrl;
		if (browser) {
			this.token = localStorage.getItem('access_token');
		}
	}

	private async refreshToken(): Promise<boolean> {
		if (this.isRefreshing) {
			return false;
		}
		this.isRefreshing = true;
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
				method: 'POST',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				this.setToken(data.data.access_token);
				return true;
			}
		} catch (e) {
			// Refresh failed
		} finally {
			this.isRefreshing = false;
		}
		return false;
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
		options: RequestInit = {},
		isRetry: boolean = false
	): Promise<{ data?: T; error?: ApiError }> {
		const headers: any = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				...options,
				headers,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

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
				// Handle 401 with token refresh (only if not already a retry)
				if (response.status === 401 && !isRetry && this.token) {
					const refreshed = await this.refreshToken();
					if (refreshed) {
						// Retry the original request
						return this.request<T>(endpoint, options, true);
					}
				}

				// Handle nested error object from backend (e.g., { error: { code: "...", message: "..." } })
				const errorObj = typeof data.error === 'object' && data.error !== null ? data.error : {};
				const errorCode = errorObj.code || data.error || 'Unknown error';
				const errorMessage = errorObj.message || data.message || data.error || 'An error occurred';

				return {
					error: {
						error: errorCode,
						message: typeof errorMessage === 'string' ? errorMessage : 'An error occurred',
						status: response.status,
						code: errorObj.code
					}
				};
			}

			return { data };
		} catch (error) {
			clearTimeout(timeoutId);

			// Handle timeout specifically
			if (error instanceof Error && error.name === 'AbortError') {
				return {
					error: {
						error: 'Timeout',
						message: 'Request timed out after 30 seconds',
						status: 0
					}
				};
			}

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

		return this.postFormData<T>(endpoint, formData);
	}

	async postFormData<T>(
		endpoint: string,
		formData: FormData,
		isRetry: boolean = false
	): Promise<{ data?: T; error?: ApiError }> {
		const headers: Record<string, string> = {};
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		// Create AbortController for timeout (longer timeout for uploads)
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.UPLOAD_TIMEOUT);

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST',
				headers,
				body: formData,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			// Safe JSON parsing — response may be empty or non-JSON (e.g. proxy errors)
			const text = await response.text();
			let data;
			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				return {
					error: {
						error: 'Server Error',
						message: text || `Server returned ${response.status}`,
						status: response.status
					}
				};
			}

			if (!response.ok) {
				// Handle 401 with token refresh (only if not already a retry)
				if (response.status === 401 && !isRetry && this.token) {
					const refreshed = await this.refreshToken();
					if (refreshed) {
						// Retry the original request
						return this.postFormData<T>(endpoint, formData, true);
					}
				}

				// Handle nested error object from backend (e.g., { error: { code: "...", message: "..." } })
				const errorObj = typeof data.error === 'object' && data.error !== null ? data.error : {};
				const errorCode = errorObj.code || data.error || 'Unknown error';
				const errorMessage = errorObj.message || data.message || 'An error occurred';

				return {
					error: {
						error: errorCode,
						message: typeof errorMessage === 'string' ? errorMessage : 'An error occurred',
						status: response.status,
						code: errorObj.code
					}
				};
			}

			return { data };
		} catch (error) {
			clearTimeout(timeoutId);

			// Handle timeout specifically
			if (error instanceof Error && error.name === 'AbortError') {
				return {
					error: {
						error: 'Timeout',
						message: 'Upload timed out. The file may be too large or the connection too slow.',
						status: 0
					}
				};
			}

			return {
				error: {
					error: 'Network error',
					message: error instanceof Error ? error.message : 'Network error occurred',
					status: 0
				}
			};
		}
	}

	async search(
		query: string,
		filters?: SearchFilters
	): Promise<{ data?: SearchResponse; error?: ApiError }> {
		const params = new URLSearchParams();
		if (query) params.append('q', query);
		if (filters?.subject_id) params.append('subject_id', filters.subject_id);
		if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
		if (filters?.mime_type) params.append('mime_type', filters.mime_type);
		if (filters?.exact) params.append('exact', 'true');
		if (filters?.category) params.append('category', filters.category);

		const endpoint = `/api/v1/search?${params.toString()}`;
		return this.get<SearchResponse>(endpoint);
	}
}

export const api = new ApiClient();
