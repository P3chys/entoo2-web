<script lang="ts">
	import { api } from '$lib/utils/api';
	import Icon from './Icon.svelte';
	import { browser } from '$app/environment';

	interface Props {
		teacherId: string;
		averageRating?: number;
		totalRatings?: number;
		userRating?: number;
		onRatingChange?: () => void;
	}

	let { teacherId, averageRating = 0, totalRatings = 0, userRating, onRatingChange }: Props = $props();

	let hoveredStar = $state<number | null>(null);
	let isSubmitting = $state(false);

	async function handleRate(rating: number) {
		if (isSubmitting || !browser) return;

		isSubmitting = true;
		const { error } = await api.post(`/api/v1/teachers/${teacherId}/rate`, { rating });

		if (!error) {
			if (onRatingChange) {
				onRatingChange();
			}
		} else {
			alert('Failed to submit rating');
		}

		isSubmitting = false;
	}

	async function handleDelete() {
		if (isSubmitting || !browser || !confirm('Odebrat vaše hodnocení?')) return;

		isSubmitting = true;
		const { error } = await api.delete(`/api/v1/teachers/${teacherId}/rate`);

		if (!error) {
			if (onRatingChange) {
				onRatingChange();
			}
		} else {
			alert('Failed to remove rating');
		}

		isSubmitting = false;
	}

	function getStarClass(starNumber: number): string {
		const effectiveRating = hoveredStar !== null ? hoveredStar : (userRating || 0);

		if (effectiveRating >= starNumber) {
			return 'text-yellow-400 fill-yellow-400';
		}
		return 'text-light-text-tertiary/30 dark:text-dark-text-tertiary/30';
	}
</script>

{#if browser}
	<div class="flex flex-col gap-1">
		<!-- Average rating display -->
		{#if totalRatings > 0}
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-0.5">
					{#each Array(5) as _, i}
						<Icon
							name="star"
							size={14}
							className={i < Math.round(averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-light-text-tertiary/30'}
						/>
					{/each}
				</div>
				<span class="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
					{(averageRating || 0).toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'hodnocení' : 'hodnocení'})
				</span>
			</div>
		{:else}
			<div class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
				Zatím bez hodnocení
			</div>
		{/if}

		<!-- Interactive rating input -->
		<div class="flex items-center gap-2">
			<span class="text-xs text-light-text-secondary dark:text-dark-text-secondary">
				{userRating ? 'Vaše hodnocení:' : 'Ohodnotit:'}
			</span>
			<div class="flex items-center gap-0.5">
				{#each Array(5) as _, i}
					<button
						class="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
						onclick={() => handleRate(i + 1)}
						onmouseenter={() => hoveredStar = i + 1}
						onmouseleave={() => hoveredStar = null}
						disabled={isSubmitting}
						title={`Rate ${i + 1} stars`}
					>
						<Icon
							name="star"
							size={16}
							className={getStarClass(i + 1)}
						/>
					</button>
				{/each}
			</div>
			{#if userRating}
				<button
					class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 flex items-center gap-1"
					onclick={handleDelete}
					disabled={isSubmitting}
					title="Odebrat hodnocení"
				>
					<Icon name="x" size={12} />
					Odebrat
				</button>
			{/if}
		</div>
	</div>
{/if}
