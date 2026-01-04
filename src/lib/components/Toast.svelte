<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte';

	interface Props {
		type?: 'success' | 'error' | 'info' | 'warning';
		message: string;
		duration?: number;
		onClose?: () => void;
	}

	let { type = 'info', message, duration = 5000, onClose }: Props = $props();

	let visible = $state(true);

	const icons = {
		success: CheckCircle,
		error: XCircle,
		info: Info,
		warning: AlertTriangle
	};

	const Icon = $derived(icons[type]);

	$effect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				visible = false;
				setTimeout(() => onClose?.(), 300);
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	function close() {
		visible = false;
		setTimeout(() => onClose?.(), 300);
	}
</script>

{#if visible}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="toast toast-{type}"
		role="alert"
		aria-live="polite"
	>
		<div class="flex items-start gap-3">
			<Icon class="w-5 h-5 flex-shrink-0 mt-0.5" />
			<p class="flex-1 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
				{message}
			</p>
			<button
				onclick={close}
				class="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
				aria-label="Close notification"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}
