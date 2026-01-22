<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon from '$components/Icon.svelte';
	import type { FlashcardDeck, DeckProgress } from '$lib/types';
	import { hoverScale } from '$lib/utils/animation';

	interface Props {
		deck: FlashcardDeck;
		progress?: DeckProgress | null;
		onFavorite?: () => void;
		onClone?: () => void;
		isCloning?: boolean;
		onclick?: () => void;
	}

	let { deck, progress = null, onFavorite, onClone, isCloning, onclick }: Props = $props();

	const masteredPercent = $derived(
		progress ? Math.round((progress.mastered_cards / progress.total_cards) * 100) : 0
	);
</script>

<div
	class="card p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
	onclick={onclick}
	use:hoverScale
	role="button"
	tabindex="0"
>
	<!-- Subject Badge -->
	{#if deck.subject}
		<div class="mb-3">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-primary/10 text-accent-primary text-sm font-medium rounded-full">
				<Icon name="book" size={14} />
				{deck.subject.name_cs}
			</span>
		</div>
	{/if}

	<!-- Header -->
	<div class="flex justify-between items-start mb-3">
		<div class="flex-1 pr-4">
			<h3 class="font-bold text-xl text-light-text-primary dark:text-dark-text-primary group-hover:text-accent-primary transition-colors">
				{deck.title}
			</h3>
			{#if deck.creator}
				<p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
					by {deck.creator.display_name || deck.creator.email}
				</p>
			{/if}
		</div>

		<div class="flex items-center gap-1 -mt-2 -mr-2">
			{#if onClone}
				<button
					class="hover:scale-110 transition-transform p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary"
					onclick={(e) => {
						e.stopPropagation();
						onClone?.();
					}}
					disabled={isCloning}
					title={$_('flashcards.clone_deck')}
					aria-label={$_('flashcards.clone_deck')}
				>
					{#if isCloning}
						<Icon name="loader" size={20} className="animate-spin" />
					{:else}
						<Icon name="copy" size={20} />
					{/if}
				</button>
			{/if}

			{#if onFavorite}
				<button
					class="hover:scale-125 transition-transform p-2"
					onclick={(e) => {
						e.stopPropagation();
						onFavorite?.();
					}}
					aria-label={deck.is_favorite ? $_('common.remove_favorite') : $_('common.add_favorite')}
				>
					{#if deck.is_favorite}
						<Icon name="star" size={24} className="text-yellow-400 fill-yellow-400" />
					{:else}
						<Icon name="star" size={24} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-yellow-400 transition-colors" />
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Description -->
	{#if deck.description}
		<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4 line-clamp-2">
			{deck.description}
		</p>
	{/if}

	<!-- Stats -->
	<div class="flex items-center gap-4 text-sm mb-4">
		<span class="flex items-center gap-1.5">
			<Icon name="layers" size={16} className="text-accent-primary" />
			<span class="font-medium">{deck.card_count}</span>
			<span class="text-light-text-secondary dark:text-dark-text-secondary">{$_('flashcards.cards')}</span>
		</span>

		{#if progress && progress.cards_due_today > 0}
			<span class="flex items-center gap-1.5 text-orange-500">
				<Icon name="clock" size={16} />
				<span class="font-medium">{progress.cards_due_today}</span>
				<span>{$_('flashcards.due')}</span>
			</span>
		{/if}

		{#if deck.is_public}
			<span class="flex items-center gap-1.5 text-blue-500">
				<Icon name="globe" size={16} />
				<span class="text-xs">{$_('flashcards.public')}</span>
			</span>
		{/if}
	</div>

	<!-- Progress Bar -->
	{#if progress && progress.total_cards > 0}
		<div class="space-y-2">
			<div class="flex justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary">
				<span>{$_('flashcards.progress')}</span>
				<span>{masteredPercent}%</span>
			</div>
			<div class="h-2 bg-light-bg-tertiary dark:dark-bg-tertiary rounded-full overflow-hidden">
				<div
					class="h-full bg-gradient-to-r from-accent-primary to-success transition-all duration-500"
					style="width: {masteredPercent}%"
				></div>
			</div>
			<div class="flex justify-between text-xs">
				<span class="text-green-500">{progress.mastered_cards} {$_('flashcards.mastered')}</span>
				<span class="text-blue-500">{progress.learning_cards} {$_('flashcards.learning')}</span>
				<span class="text-light-text-secondary dark:text-dark-text-secondary">{progress.new_cards} {$_('flashcards.new')}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
