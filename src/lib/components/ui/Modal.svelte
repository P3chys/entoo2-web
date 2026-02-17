<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
		class?: string;
	}

	let { isOpen, onClose, children, maxWidth = 'md', class: className = '' }: Props = $props();

	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'4xl': 'max-w-4xl',
		'5xl': 'max-w-5xl'
	};

	let dialogElement: HTMLDivElement | undefined = $state();
	let previousActiveElement: HTMLElement | null = null;

	// Handle Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			onClose();
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		// Only close if clicking directly on the backdrop, not on children
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	// Focus management
	$effect(() => {
		if (isOpen && dialogElement) {
			// Store the currently focused element
			previousActiveElement = document.activeElement as HTMLElement;

			// Focus the dialog element
			dialogElement.focus();

			return () => {
				// Restore focus when modal closes
				if (previousActiveElement) {
					previousActiveElement.focus();
				}
			};
		}
	});
</script>

{#if isOpen}
	<div
		class="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
		role="presentation"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div
			bind:this={dialogElement}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			class="modal-content bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-6 w-full {maxWidthClasses[
				maxWidth
			]} max-h-[90vh] overflow-y-auto {className}"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			{@render children()}
		</div>
	</div>
{/if}
