<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import Icon from '$components/Icon.svelte';
	import Button from '$components/Button.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import StudyCard from '$lib/components/flashcards/StudyCard.svelte';
	import type { Flashcard } from '$lib/types';
	import { fadeSlideIn } from '$lib/utils/animation';

	const deckId = $page.params.id;

	let sessionId = $state('');
	let cards: Flashcard[] = $state([]);
	let currentCardIndex = $state(0);
	let loading = $state(true);
	let error = $state('');
	let studyComplete = $state(false);
	let cardsStudied = $state(0);
	let cardsCorrect = $state(0);
	let startTime = $state(0);

	const currentCard = $derived(cards[currentCardIndex]);
	const isLastCard = $derived(currentCardIndex === cards.length - 1);

	async function startSession() {
		loading = true;
		error = '';
		startTime = Date.now();

		const { data, error: err } = await api.post<{
			success: boolean;
			data: { session_id: string; cards: Flashcard[]; cards_total: number };
		}>(`/api/v1/decks/${deckId}/study/start`, {});

		if (err) {
			error = err.message || $_('common.failed_to_load');
		} else if (data?.success) {
			sessionId = data.data.session_id;
			cards = data.data.cards;
		}

		loading = false;
	}

	async function handleAnswer(quality: number) {
		// Record review
		const { error: err } = await api.post(`/api/v1/study-sessions/${sessionId}/review`, {
			flashcard_id: currentCard.id,
			quality
		});

		if (!err) {
			cardsStudied++;
			if (quality >= 3) {
				cardsCorrect++;
			}

			// Move to next card or complete session
			if (isLastCard) {
				await completeSession();
			} else {
				currentCardIndex++;
			}
		}
	}

	async function completeSession() {
		const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

		await api.post(`/api/v1/study-sessions/${sessionId}/complete`, {
			duration_seconds: durationSeconds
		});

		studyComplete = true;
	}

	function restartStudy() {
		currentCardIndex = 0;
		cardsStudied = 0;
		cardsCorrect = 0;
		studyComplete = false;
		startSession();
	}

	function returnToDeck() {
		goto(`/decks/${deckId}`);
	}

	onMount(() => {
		startSession();
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
	{:else if studyComplete}
		<!-- Completion Summary -->
		<div class="flex flex-col items-center justify-center min-h-[500px]" use:fadeSlideIn>
			<div class="card p-8 max-w-2xl w-full text-center">
				<div class="mb-6">
					<Icon name="award" size={64} className="text-accent-primary mx-auto mb-4" />
					<h1 class="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
						{$_('flashcards.study_complete')}
					</h1>
					<p class="text-light-text-secondary dark:text-dark-text-secondary">
						{$_('flashcards.great_job')}
					</p>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-2 gap-4 mb-8">
					<div class="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
						<div class="text-3xl font-bold text-accent-primary mb-1">
							{cardsStudied}
						</div>
						<div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
							{$_('flashcards.cards_studied')}
						</div>
					</div>
					<div class="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
						<div class="text-3xl font-bold text-success mb-1">
							{cardsStudied > 0 ? Math.round((cardsCorrect / cardsStudied) * 100) : 0}%
						</div>
						<div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
							{$_('flashcards.accuracy')}
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 justify-center">
					<Button variant="secondary" onclick={returnToDeck}>
						<Icon name="arrow-left" size={18} />
						{$_('flashcards.back_to_deck')}
					</Button>
					<Button variant="primary" onclick={restartStudy}>
						<Icon name="refresh" size={18} />
						{$_('flashcards.study_again')}
					</Button>
				</div>
			</div>
		</div>
	{:else if currentCard}
		<!-- Back link -->
		<div class="mb-4" use:fadeSlideIn>
			<a
				href="/decks/{deckId}"
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

		<!-- Study Card -->
		{#key currentCard.id}
			<StudyCard
				flashcard={currentCard}
				cardNumber={currentCardIndex + 1}
				totalCards={cards.length}
				onAnswer={handleAnswer}
			/>
		{/key}
	{/if}
</div>
