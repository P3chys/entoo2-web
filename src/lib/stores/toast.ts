import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,
		show: (toast: Omit<Toast, 'id'>) => {
			const id = Math.random().toString(36).substring(7);
			update((toasts) => [...toasts, { ...toast, id }]);
			return id;
		},
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		success: (message: string, duration?: number) => {
			return createToastStore().show({ type: 'success', message, duration });
		},
		error: (message: string, duration?: number) => {
			return createToastStore().show({ type: 'error', message, duration });
		},
		info: (message: string, duration?: number) => {
			return createToastStore().show({ type: 'info', message, duration });
		},
		warning: (message: string, duration?: number) => {
			return createToastStore().show({ type: 'warning', message, duration });
		}
	};
}

export const toasts = createToastStore();
