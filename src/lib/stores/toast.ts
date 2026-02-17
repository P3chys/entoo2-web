import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	const show = (toast: Omit<Toast, 'id'>) => {
		const id = Math.random().toString(36).substring(7);
		update((toasts) => [...toasts, { ...toast, id }]);
		return id;
	};

	return {
		subscribe,
		show,
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		success: (message: string, duration?: number) => {
			return show({ type: 'success', message, duration });
		},
		error: (message: string, duration?: number) => {
			return show({ type: 'error', message, duration });
		},
		info: (message: string, duration?: number) => {
			return show({ type: 'info', message, duration });
		},
		warning: (message: string, duration?: number) => {
			return show({ type: 'warning', message, duration });
		}
	};
}

export const toasts = createToastStore();
