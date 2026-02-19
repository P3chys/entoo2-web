<script lang="ts">
	/**
	 * Pagination Component
	 * Displays page navigation controls for paginated content
	 */

	import { _ } from 'svelte-i18n';

	interface Props {
		/** Current page number (1-indexed) */
		currentPage: number;
		/** Total number of pages */
		totalPages: number;
		/** Number of page buttons to show around current page */
		siblingCount?: number;
		/** Callback when page changes */
		onPageChange: (page: number) => void;
		/** Custom CSS classes */
		class?: string;
		/** Whether the pagination is disabled */
		disabled?: boolean;
	}

	let {
		currentPage,
		totalPages,
		siblingCount = 1,
		onPageChange,
		class: className = '',
		disabled = false
	}: Props = $props();

	// Generate page numbers to display
	const pageNumbers = $derived.by(() => {
		const pages: (number | 'ellipsis')[] = [];

		if (totalPages <= 1) return pages;

		// Always show first page
		pages.push(1);

		// Calculate range around current page
		const leftSibling = Math.max(2, currentPage - siblingCount);
		const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

		// Add ellipsis after first page if needed
		if (leftSibling > 2) {
			pages.push('ellipsis');
		}

		// Add pages around current page
		for (let i = leftSibling; i <= rightSibling; i++) {
			if (i !== 1 && i !== totalPages) {
				pages.push(i);
			}
		}

		// Add ellipsis before last page if needed
		if (rightSibling < totalPages - 1) {
			pages.push('ellipsis');
		}

		// Always show last page (if more than 1 page)
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	});

	const canGoPrev = $derived(currentPage > 1 && !disabled);
	const canGoNext = $derived(currentPage < totalPages && !disabled);

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
			onPageChange(page);
		}
	}

	function goPrev() {
		if (canGoPrev) {
			goToPage(currentPage - 1);
		}
	}

	function goNext() {
		if (canGoNext) {
			goToPage(currentPage + 1);
		}
	}

	const baseButtonClass = 'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200';
	const activeClass = 'bg-primary text-primary-content';
	const inactiveClass = 'bg-base-200 hover:bg-base-300 text-base-content';
	const disabledClass = 'opacity-50 cursor-not-allowed';
</script>

{#if totalPages > 1}
	<nav
		class="flex items-center justify-center gap-1 {className}"
		aria-label={$_('pagination.navigation', { default: 'Pagination' })}
	>
		<!-- Previous button -->
		<button
			type="button"
			class="{baseButtonClass} {canGoPrev ? inactiveClass : disabledClass}"
			disabled={!canGoPrev}
			onclick={goPrev}
			aria-label={$_('pagination.previous', { default: 'Previous page' })}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<!-- Page numbers -->
		{#each pageNumbers as page, index}
			{#if page === 'ellipsis'}
				<span class="px-2 py-2 text-base-content/60" aria-hidden="true">...</span>
			{:else}
				<button
					type="button"
					class="{baseButtonClass} {page === currentPage ? activeClass : inactiveClass} {disabled
						? disabledClass
						: ''}"
					{disabled}
					onclick={() => goToPage(page)}
					aria-label={$_('pagination.goToPage', {
						default: `Go to page ${page}`,
						values: { page }
					})}
					aria-current={page === currentPage ? 'page' : undefined}
				>
					{page}
				</button>
			{/if}
		{/each}

		<!-- Next button -->
		<button
			type="button"
			class="{baseButtonClass} {canGoNext ? inactiveClass : disabledClass}"
			disabled={!canGoNext}
			onclick={goNext}
			aria-label={$_('pagination.next', { default: 'Next page' })}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</nav>
{/if}
