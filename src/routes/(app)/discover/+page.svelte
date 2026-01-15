<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import Icon from '$components/Icon.svelte';
	import Button from '$components/Button.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import DeckCard from '$components/flashcards/DeckCard.svelte';
	import Input from '$components/Input.svelte';
	import type { FlashcardDeck, Subject, DeckProgress } from '$lib/types';
	import { fadeSlideIn } from '$lib/utils/animation';

	let decks: FlashcardDeck[] = $state([]);
	let filteredDecks: FlashcardDeck[] = $state([]);
	let subjects: Subject[] = $state([]);
	let deckProgress: Record<string, DeckProgress> = $state({});
	let loading = $state(true);
	let error = $state('');
	let selectedSubjectId = $state('');
	let searchQuery = $state('');
	let cloning = $state<string | null>(null);

	// Filter decks based on search and subject selection
	const filterDecks = $derived.by(() => {
		let result = decks;

		// Filter by subject
		if (selectedSubjectId) {
			result = result.filter((d) => d.subject_id === selectedSubjectId);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(d) =>
					d.title.toLowerCase().includes(query) ||
					d.description?.toLowerCase().includes(query) ||
					d.creator?.display_name?.toLowerCase().includes(query)
			);
		}

		return result;
	});

	// Update filteredDecks when filterDecks changes
	$effect(() => {
		filteredDecks = filterDecks;
	});

	async function loadData() {
		loading = true;
		error = '';

		// Load public decks
		const decksRes = await api.get<{ success: boolean; data: FlashcardDeck[] }>(
			'/api/v1/decks'
		);

		if (decksRes.error) {
			error = decksRes.error.message || $_('common.failed_to_load');
		} else if (decksRes.data?.success) {
			decks = decksRes.data.data || [];
			filteredDecks = decks;

			// Load progress for each deck in parallel
			const progressPromises = decks.map(async (deck) => {
				const progressRes = await api.get<{ success: boolean; data: DeckProgress }>(
					`/api/v1/decks/${deck.id}/progress`
				);
				if (progressRes.data?.success) {
					return { deckId: deck.id, progress: progressRes.data.data };
				}
				return null;
			});

			const progressResults = await Promise.all(progressPromises);
			const newProgress: Record<string, DeckProgress> = {};
			for (const result of progressResults) {
				if (result) {
					newProgress[result.deckId] = result.progress;
				}
			}
			deckProgress = newProgress;
		}

		// Load subjects for filtering
		const subjectsRes = await api.get<{ success: boolean; data: Subject[] }>(
			'/api/v1/subjects'
		);

		if (subjectsRes.data?.success) {
			subjects = subjectsRes.data.data || [];
		}

		loading = false;
	}

	async function handleCloneDeck(deckId: string, e: Event) {
		e.stopPropagation();
		cloning = deckId;

		const { data, error: err } = await api.post<{ success: boolean; data: FlashcardDeck }>(
			`/api/v1/decks/${deckId}/clone`,
			{}
		);

		cloning = null;

		if (err) {
			alert(err.message || $_('common.error'));
		} else if (data?.success && data.data) {
			// Navigate to the new deck
			goto(`/decks/${data.data.id}`);
		}
	}

	async function handleToggleFavorite(deckId: string) {
		const { error: err } = await api.post(`/api/v1/decks/${deckId}/favorite`, {});

		if (!err) {
			// Refresh decks
			loadData();
		}
	}

	function handleDeckClick(deckId: string) {
		goto(`/decks/${deckId}`);
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="h-full flex flex-col" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div class="mb-6" use:fadeSlideIn>
		<h1 class="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3">
			<Icon name="globe" size={32} className="text-accent-primary" />
			{$_('flashcards.discover')}
		</h1>
		<p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
			{$_('flashcards.discover_subtitle')}
		</p>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner />
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
		</div>
	{:else}
		<!-- Filters -->
		<div class="flex flex-col sm:flex-row gap-4 mb-6" use:fadeSlideIn={{ delay: 50 }}>
			<!-- Search -->
			<div class="flex-1">
				<Input
					bind:value={searchQuery}
					placeholder={$_('flashcards.search_decks')}
					icon="search"
				/>
			</div>

			<!-- Subject filter -->
			<div class="sm:w-64">
				<select
					bind:value={selectedSubjectId}
					class="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-lg
						   bg-light-bg-secondary dark:bg-dark-bg-secondary
						   text-light-text-primary dark:text-dark-text-primary
						   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
				>
					<option value="">{$_('flashcards.all_subjects')}</option>
					{#each subjects as subject}
						<option value={subject.id}>{subject.name_cs}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Stats -->
		<div class="mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary" use:fadeSlideIn={{ delay: 75 }}>
			{filteredDecks.length} {$_('flashcards.decks')}
			{#if selectedSubjectId || searchQuery}
				<button
					class="ml-2 text-accent-primary hover:underline"
					onclick={() => {
						selectedSubjectId = '';
						searchQuery = '';
					}}
				>
					{$_('search.clearFilters')}
				</button>
			{/if}
		</div>

		<!-- Decks Grid -->
		{#if filteredDecks.length === 0}
			<div class="text-center py-12" use:fadeSlideIn={{ delay: 100 }}>
				<Icon name="globe" size={64} className="text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4 opacity-50" />
				<p class="text-light-text-secondary dark:text-dark-text-secondary mb-2">
					{$_('flashcards.no_public_decks')}
				</p>
				<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
					{$_('flashcards.no_public_decks_desc')}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" use:fadeSlideIn={{ delay: 100 }}>
				{#each filteredDecks as deck (deck.id)}
					<div class="relative">
						<DeckCard
							{deck}
							progress={deckProgress[deck.id]}
							onFavorite={() => handleToggleFavorite(deck.id)}
							onclick={() => handleDeckClick(deck.id)}
						/>

						<!-- Clone button - always visible -->
						<div class="absolute top-2 right-12">
							<button
								class="bg-accent-primary hover:bg-accent-primary/90 text-white p-2 rounded-lg shadow-lg transition-all hover:scale-110"
								onclick={(e) => handleCloneDeck(deck.id, e)}
								disabled={cloning === deck.id}
								title={$_('flashcards.clone_deck')}
							>
								{#if cloning === deck.id}
									<Icon name="loader" size={18} className="animate-spin" />
								{:else}
									<Icon name="copy" size={18} />
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
