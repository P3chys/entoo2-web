import { writable, derived } from 'svelte/store';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '$types';
import { api } from '$utils/api';
import { browser } from '$app/environment';

interface AuthState {
	user: User | null;
	loading: boolean;
	initialized: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: false,
		initialized: false
	});

	return {
		subscribe,

		async initialize() {
			if (!browser) return;

			const token = api.getToken();
			if (!token) {
				update((state) => ({ ...state, initialized: true }));
				return;
			}

			update((state) => ({ ...state, loading: true }));

			const { data, error } = await api.get<{ success: boolean; data: User }>('/api/v1/auth/me');

			if (error || !data || !data.success) {
				// Token is invalid, clear it
				api.setToken(null);
				update((state) => ({ ...state, user: null, loading: false, initialized: true }));
				return;
			}

			update((state) => ({ ...state, user: data.data, loading: false, initialized: true }));
		},

		async login(credentials: LoginRequest) {
			update((state) => ({ ...state, loading: true }));

			const { data, error } = await api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/login', credentials);

			if (error || !data || !data.success) {
				update((state) => ({ ...state, loading: false }));
				return { error: error || { error: 'Unknown error', message: 'Login failed', status: 500 } };
			}

			const authData = data.data;
			api.setToken(authData.access_token);
			update((state) => ({ ...state, user: authData.user, loading: false }));

			return { data: authData };
		},

		async register(credentials: RegisterRequest) {
			update((state) => ({ ...state, loading: true }));

			const { data, error } = await api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/register', credentials);

			if (error || !data || !data.success) {
				update((state) => ({ ...state, loading: false }));
				return { error: error || { error: 'Unknown error', message: 'Registration failed', status: 500 } };
			}

			const authData = data.data;
			api.setToken(authData.access_token);
			update((state) => ({ ...state, user: authData.user, loading: false }));

			return { data: authData };
		},

		async logout() {
			api.setToken(null);
			set({ user: null, loading: false, initialized: true });
		}
	};
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(authStore, ($auth) => $auth.user !== null);
export const isAdmin = derived(authStore, ($auth) => $auth.user?.role === 'admin');
export const currentUser = derived(authStore, ($auth) => $auth.user);
