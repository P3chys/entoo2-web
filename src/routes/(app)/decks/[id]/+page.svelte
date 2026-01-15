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
	import FlashcardEditor from '$components/flashcards/FlashcardEditor.svelte';
	import type { FlashcardDeck, Flashcard } from '$lib/types';
	import { fadeSlideIn } from '$lib/utils/animation';

	const deckId = $page.params.id;

	let deck: FlashcardDeck | null = $state(null);
	let loading = $state(true);
	let error = $state('');
	let showEditor = $state(false);
	let editingCard: Partial<Flashcard> | null = $state(null);

	const isOwner = $derived(
		deck && $currentUser && (deck.created_by === $currentUser.id || $currentUser.role === 'admin')
	);

	async function loadDeck() {
		loading = true;
		error = '';

		const { data, error: err } = await api.get<{ success: boolean; data: FlashcardDeck }>(
			`/api/v1/decks/${deckId}`
		);

		if (err) {
			error = err.message || $_('common.failed_to_load');
		} else if (data?.success) {
			deck = data.data;
		}

		loading = false;
	}

	async function handleSaveCard(card: Partial<Flashcard>) {
		// Build card data with all fields
		const cardData: Record<string, unknown> = {
			card_type: card.card_type || 'standard',
			front_text: card.front_text,
			back_text: card.back_text
		};

		// Add multiple choice fields if applicable
		if (card.card_type === 'multiple_choice') {
			// Parse options if it's a JSON string, otherwise use as-is
			if (card.options) {
				try {
					cardData.options = typeof card.options === 'string'
						? JSON.parse(card.options)
						: card.options;
				} catch {
					cardData.options = [];
				}
			}
			if (card.correct_option !== undefined) {
				cardData.correct_option = card.correct_option;
			}
		}

		if (card.id) {
			// Update existing card
			const { error: err } = await api.put(`/api/v1/cards/${card.id}`, cardData);

			if (err) {
				throw new Error(err.message);
			}
		} else {
			// Create new card
			const { error: err } = await api.post(`/api/v1/decks/${deckId}/cards`, cardData);

			if (err) {
				throw new Error(err.message);
			}
		}

		// Reload deck
		await loadDeck();
		showEditor = false;
		editingCard = null;
	}

	async function handleDeleteCard(cardId: string) {
		if (!confirm($_('flashcards.confirm_delete_card'))) return;

		const { error: err } = await api.delete(`/api/v1/cards/${cardId}`);

		if (!err) {
			await loadDeck();
		}
	}

	function handleAddCard() {
		editingCard = null;
		showEditor = true;
	}

	function handleEditCard(card: Flashcard) {
		editingCard = card;
		showEditor = true;
	}

	function handleCancelEdit() {
		showEditor = false;
		editingCard = null;
	}

	async function handleToggleFavorite() {
		await api.post(`/api/v1/decks/${deckId}/favorite`, {});
		await loadDeck();
	}

	async function handleDeleteDeck() {
		if (!confirm($_('flashcards.confirm_delete_deck'))) return;

		const { error: err } = await api.delete(`/api/v1/decks/${deckId}`);

		if (!err) {
			// Navigate back to subject flashcards page
			if (deck?.subject_id) {
				goto(`/subjects/${deck.subject_id}/flashcards`);
			} else {
				goto('/');
			}
		}
	}

	onMount(() => {
		loadDeck();
	});
</script>

<div class="h-full flex flex-col" in:fade={{ duration: 200 }}>
	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner />
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
		</div>
	{:else if deck}
		<!-- Back link -->
		<div class="mb-4" use:fadeSlideIn>
			<a
				href="/subjects/{deck.subject_id}/flashcards"
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
		<div class="mb-6 card p-6" use:fadeSlideIn={{ delay: 50 }}>
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-3 mb-2">
						<h1
							class="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary"
						>
							{deck.title}
						</h1>
						<button
							class="hover:scale-110 transition-transform"
							onclick={handleToggleFavorite}
							aria-label={deck.is_favorite
								? $_('common.remove_favorite')
								: $_('common.add_favorite')}
						>
							{#if deck.is_favorite}
								<Icon name="star" size={28} className="text-yellow-400 fill-yellow-400" />
							{:else}
								<Icon
									name="star"
									size={28}
									className="text-light-text-secondary/30 hover:text-yellow-400"
								/>
							{/if}
						</button>
					</div>

					{#if deck.description}
						<p class="text-light-text-secondary dark:text-dark-text-secondary mb-3">
							{deck.description}
						</p>
					{/if}

					<div class="flex items-center gap-4 text-sm">
						<span class="flex items-center gap-1.5">
							<Icon name="layers" size={16} className="text-accent-primary" />
							<span class="font-medium">{deck.card_count}</span>
							<span class="text-light-text-secondary dark:text-dark-text-secondary"
								>{$_('flashcards.cards')}</span
							>
						</span>

						{#if deck.creator}
							<span class="flex items-center gap-1.5 text-light-text-secondary dark:text-dark-text-secondary">
								<Icon name="user" size={16} />
								{deck.creator.display_name || deck.creator.email}
							</span>
						{/if}

						{#if deck.is_public}
							<span class="flex items-center gap-1.5 text-blue-500">
								<Icon name="globe" size={16} />
								{$_('flashcards.public')}
							</span>
						{/if}
					</div>
				</div>

				<div class="flex gap-2">
					{#if isOwner}
						<Button variant="secondary" onclick={() => goto(`/decks/${deckId}/edit`)}>
							<Icon name="edit" size={16} />
							{$_('common.edit')}
						</Button>
						<Button variant="secondary" onclick={handleDeleteDeck}>
							<Icon name="trash" size={16} />
						</Button>
					{/if}
				</div>
			</div>
		</div>

	<!-- Start Study Button -->
	{#if deck.card_count > 0}
		<div class="mb-4" use:fadeSlideIn={{ delay: 100 }}>
			<Button onclick={() => goto(`/decks/${deckId}/study`)} size="lg">
				<Icon name="play" size={20} />
				{$_('flashcards.start_study')}
			</Button>
		</div>
	{/if}

		<!-- Add Card Button -->
		{#if isOwner}
			<div class="mb-4" use:fadeSlideIn={{ delay: 100 }}>
				<Button onclick={handleAddCard}>
					<Icon name="plus" size={16} />
					{$_('flashcards.add_card')}
				</Button>
			</div>
		{/if}

		<!-- Editor -->
		{#if showEditor}
			<div class="mb-6" use:fadeSlideIn={{ delay: 150 }}>
				<FlashcardEditor
					flashcard={editingCard || {}}
					onSave={handleSaveCard}
					onCancel={handleCancelEdit}
				/>
			</div>
		{/if}

		<!-- Flashcards List -->
		{#if !deck.flashcards || deck.flashcards.length === 0}
			<div class="text-center py-12 card" use:fadeSlideIn={{ delay: 150 }}>
				<Icon
					name="layers"
					size={64}
					className="text-light-text-secondary dark:text-dark-text-secondary mx-auto mb-4 opacity-50"
				/>
				<p class="text-light-text-secondary dark:text-dark-text-secondary mb-4">
					{$_('flashcards.no_cards')}
				</p>
				{#if isOwner}
					<Button onclick={handleAddCard}>
						{$_('flashcards.add_first_card')}
					</Button>
				{/if}
			</div>
		{:else}
			<div class="space-y-4" use:fadeSlideIn={{ delay: 150 }}>
				{#each deck.flashcards as card, index (card.id)}
					<div class="card p-6 hover:shadow-lg transition-shadow">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 space-y-4">
								<!-- Front -->
								<div>
									<div class="flex items-center gap-2 mb-2">
										<span
											class="text-xs font-medium text-accent-primary bg-accent-primary/10 px-2 py-1 rounded"
										>
											#{index + 1}
										</span>
										<span
											class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
										>
											{$_('flashcards.front')}
										</span>
									</div>
									<p class="text-light-text-primary dark:text-dark-text-primary">
										{card.front_text}
									</p>
								</div>

								<!-- Back -->
								<div>
									<span
										class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary block mb-2"
									>
										{$_('flashcards.back')}
									</span>
									<p class="text-light-text-primary dark:text-dark-text-primary">
										{card.back_text}
									</p>
								</div>
							</div>

							<!-- Actions -->
							{#if isOwner}
								<div class="flex gap-2">
									<button
										class="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full p-2 transition-colors"
										onclick={() => handleEditCard(card)}
										aria-label={$_('common.edit')}
									>
										<Icon name="edit" size={18} className="text-accent-primary" />
									</button>
									<button
										class="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-2 transition-colors"
										onclick={() => handleDeleteCard(card.id)}
										aria-label={$_('common.delete')}
									>
										<Icon name="trash" size={18} className="text-red-500" />
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
