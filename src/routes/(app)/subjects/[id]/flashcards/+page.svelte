<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import { currentUser } from '$stores/auth';
	import Icon from '$components/Icon.svelte';
	import Button from '$components/Button.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import DeckCard from '$components/flashcards/DeckCard.svelte';
	import Input from '$components/Input.svelte';
	import type { FlashcardDeck, Subject, DeckProgress } from '$lib/types';
	import { fadeSlideIn } from '$lib/utils/animation';

	const subjectId = $page.params.id;

	let subject: Subject | null = $state(null);
	let decks: FlashcardDeck[] = $state([]);
	let deckProgress: Record<string, DeckProgress> = $state({});
	let loading = $state(true);
	let error = $state('');
	let showCreateModal = $state(false);
	let includePublic = $state(true);

	// New deck form
	let newDeckTitle = $state('');
	let newDeckDescription = $state('');
	let newDeckPublic = $state(false);
	let creating = $state(false);

	async function loadData() {
		loading = true;
		error = '';

		// Load subject info
		const subjectRes = await api.get<{ success: boolean; data: Subject }>(
			`/api/v1/subjects/${subjectId}`
		);

		if (subjectRes.error) {
			error = subjectRes.error.message || $_('common.failed_to_load');
		} else if (subjectRes.data?.success) {
			subject = subjectRes.data.data;
		}

		// Load decks
		const decksRes = await api.get<{ success: boolean; data: FlashcardDeck[] }>(
			`/api/v1/subjects/${subjectId}/decks?include_public=${includePublic}`
		);

		if (decksRes.data?.success) {
			decks = decksRes.data.data || [];

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

		loading = false;
	}

	async function handleCreateDeck() {
		if (!newDeckTitle.trim()) return;

		creating = true;
		const { data, error: err } = await api.post<{ success: boolean; data: FlashcardDeck }>(
			`/api/v1/subjects/${subjectId}/decks`,
			{
				title: newDeckTitle.trim(),
				description: newDeckDescription.trim(),
				is_public: newDeckPublic
			}
		);

		creating = false;

		if (err) {
			alert(err.message || $_('common.error'));
		} else if (data?.success && data.data) {
			// Navigate to deck detail page
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
	<!-- Back link -->
	<div class="mb-4" use:fadeSlideIn>
		<a
			href="/subjects/{subjectId}"
			class="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors group"
		>
			<Icon
				name="arrow-left"
				size={16}
				className="group-hover:-translate-x-1 transition-transform"
			/>
			{$_('common.back')}
		</a>
	</div>

	<!-- Header -->
	<div class="mb-6" use:fadeSlideIn={{ delay: 50 }}>
		<h1
			class="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3"
		>
			<Icon name="layers" size={32} className="text-accent-primary" />
			{$_('flashcards.title')}
		</h1>
		{#if subject}
			<p class="text-light-text-secondary dark:text-dark-text-secondary mt-2">
				{subject.name_cs}
			</p>
		{/if}
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
		<!-- Actions -->
		<div class="flex items-center justify-between mb-6" use:fadeSlideIn={{ delay: 100 }}>
			<div class="flex items-center gap-4">
				<label class="flex items-center gap-2 text-sm cursor-pointer">
					<input
						type="checkbox"
						bind:checked={includePublic}
						onchange={loadData}
						class="rounded border-light-border-primary dark:border-dark-border-primary"
					/>
					<span class="text-light-text-secondary dark:text-dark-text-secondary">
						{$_('flashcards.include_public')}
					</span>
				</label>

				<span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
					{decks.length}
					{$_('flashcards.decks')}
				</span>
			</div>

			<Button onclick={() => (showCreateModal = true)}>
				<Icon name="plus" size={16} />
				{$_('flashcards.create_deck')}
			</Button>
		</div>

		<!-- Decks Grid -->
		{#if decks.length === 0}
			<div class="text-center py-12" use:fadeSlideIn={{ delay: 150 }}>
				<Icon
					name="layers"
					size={64}
					className="text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4 opacity-50"
				/>
				<p class="text-light-text-secondary dark:text-dark-text-secondary mb-4">
					{$_('flashcards.no_decks')}
				</p>
				<Button onclick={() => (showCreateModal = true)}>
					{$_('flashcards.create_first_deck')}
				</Button>
			</div>
		{:else}
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				use:fadeSlideIn={{ delay: 150 }}
			>
				{#each decks as deck (deck.id)}
					<DeckCard
						{deck}
						progress={deckProgress[deck.id]}
						onFavorite={() => handleToggleFavorite(deck.id)}
						onclick={() => handleDeckClick(deck.id)}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<!-- Create Deck Modal -->
{#if showCreateModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		transition:fade={{ duration: 200 }}
		onclick={(e) => {
			if (e.target === e.currentTarget) showCreateModal = false;
		}}
	>
		<div class="card p-6 max-w-lg w-full space-y-4" onclick={(e) => e.stopPropagation()}>
			<!-- Modal Header -->
			<div class="flex items-center justify-between mb-2">
				<h2
					class="text-xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2"
				>
					<Icon name="plus" size={24} className="text-accent-primary" />
					{$_('flashcards.create_deck')}
				</h2>
				<button
					class="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full p-1 transition-colors"
					onclick={() => (showCreateModal = false)}
				>
					<Icon name="x" size={20} />
				</button>
			</div>

			<!-- Form -->
			<div class="space-y-4">
				<div>
					<label
						class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
					>
						{$_('flashcards.deck_title')} <span class="text-red-500">*</span>
					</label>
					<Input
						bind:value={newDeckTitle}
						placeholder={$_('flashcards.deck_title_placeholder')}
						maxlength={200}
					/>
				</div>

				<div>
					<label
						class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
					>
						{$_('flashcards.deck_description')}
					</label>
					<textarea
						bind:value={newDeckDescription}
						class="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-lg
							   bg-light-bg-secondary dark:bg-dark-bg-secondary
							   text-light-text-primary dark:text-dark-text-primary
							   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
							   resize-none"
						rows="3"
						placeholder={$_('flashcards.deck_description_placeholder')}
					></textarea>
				</div>

				<div>
					<label class="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="checkbox"
							bind:checked={newDeckPublic}
							class="rounded border-light-border-primary dark:border-dark-border-primary"
						/>
						<span class="text-light-text-secondary dark:text-dark-text-secondary">
							{$_('flashcards.make_public')}
						</span>
					</label>
					<p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 ml-6">
						{$_('flashcards.public_description')}
					</p>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-3 justify-end pt-4">
				<Button variant="ghost" onclick={() => (showCreateModal = false)} disabled={creating}>
					{$_('common.cancel')}
				</Button>
				<Button
					onclick={handleCreateDeck}
					disabled={!newDeckTitle.trim() || creating}
					loading={creating}
				>
					{$_('flashcards.create_deck')}
				</Button>
			</div>
		</div>
	</div>
{/if}
