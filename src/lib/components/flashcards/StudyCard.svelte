<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon from '$components/Icon.svelte';
	import Button from '$components/Button.svelte';
	import type { Flashcard } from '$lib/types';

	interface Props {
		flashcard: Flashcard;
		cardNumber: number;
		totalCards: number;
		onAnswer: (quality: number) => void;
	}

	let { flashcard, cardNumber, totalCards, onAnswer }: Props = $props();

	let isFlipped = $state(false);
	let selectedOption = $state<number | null>(null);
	let showResult = $state(false);

	// Parse options for multiple choice cards
	const parsedOptions = $derived.by<string[]>(() => {
		if (flashcard.card_type === 'multiple_choice' && flashcard.options) {
			try {
				return JSON.parse(flashcard.options);
			} catch {
				return [];
			}
		}
		return [];
	});

	const isMultipleChoice = $derived(flashcard.card_type === 'multiple_choice');
	const isAnswerCorrect = $derived(selectedOption === flashcard.correct_option);

	function handleFlip() {
		if (!isMultipleChoice) {
			isFlipped = !isFlipped;
		}
	}

	function handleOptionSelect(index: number) {
		if (showResult) return; // Already answered
		selectedOption = index;
		showResult = true;
	}

	function handleAnswer(quality: number) {
		onAnswer(quality);
	}
</script>

<div class="flex flex-col items-center justify-center min-h-[500px] p-6">
	<!-- Progress indicator -->
	<div class="w-full max-w-2xl mb-6">
		<div class="flex items-center justify-between mb-2">
			<span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
				{$_('flashcards.card')} {cardNumber} / {totalCards}
			</span>
			<span class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
				{Math.round((cardNumber / totalCards) * 100)}%
			</span>
		</div>
		<div class="w-full h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full overflow-hidden">
			<div
				class="h-full bg-accent-primary transition-all duration-300"
				style="width: {(cardNumber / totalCards) * 100}%"
			></div>
		</div>
	</div>

	<!-- Flashcard -->
	{#if isMultipleChoice}
		<!-- Multiple Choice Card -->
		<div class="w-full max-w-2xl">
			<div class="card p-8 relative">
				<div class="absolute top-4 left-4">
					<span class="text-xs font-medium text-accent-primary bg-accent-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1">
						<Icon name="list" size={12} />
						{$_('flashcards.multiple_choice')}
					</span>
				</div>

				<!-- Question -->
				<div class="pt-8 pb-6">
					<p class="text-2xl font-medium text-light-text-primary dark:text-dark-text-primary text-center">
						{flashcard.front_text}
					</p>
				</div>

				<!-- Options -->
				<div class="space-y-3 mt-4">
					{#each parsedOptions as option, index}
						<button
							type="button"
							onclick={() => handleOptionSelect(index)}
							disabled={showResult}
							class="w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center gap-3
								{showResult && index === flashcard.correct_option
									? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-400'
									: showResult && selectedOption === index && !isAnswerCorrect
										? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-400'
										: selectedOption === index
											? 'bg-accent-primary/10 border-2 border-accent-primary'
											: 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-2 border-transparent hover:border-accent-primary/50'}"
						>
							<span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
								{showResult && index === flashcard.correct_option
									? 'bg-green-500 text-white'
									: showResult && selectedOption === index && !isAnswerCorrect
										? 'bg-red-500 text-white'
										: 'bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-secondary dark:text-dark-text-secondary'}">
								{#if showResult && index === flashcard.correct_option}
									<Icon name="check" size={16} />
								{:else if showResult && selectedOption === index && !isAnswerCorrect}
									<Icon name="x" size={16} />
								{:else}
									{String.fromCharCode(65 + index)}
								{/if}
							</span>
							<span class="flex-1 text-light-text-primary dark:text-dark-text-primary">
								{option}
							</span>
						</button>
					{/each}
				</div>

				<!-- Result Message -->
				{#if showResult}
					<div class="mt-6 p-4 rounded-lg text-center
						{isAnswerCorrect
							? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
							: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}">
						{#if isAnswerCorrect}
							<div class="flex items-center justify-center gap-2">
								<Icon name="check" size={20} />
								<span class="font-medium">{$_('flashcards.correct')}</span>
							</div>
						{:else}
							<div class="flex items-center justify-center gap-2">
								<Icon name="x" size={20} />
								<span class="font-medium">{$_('flashcards.incorrect')}</span>
							</div>
							<p class="mt-2 text-sm">
								{$_('flashcards.correct_answer_was')}: <strong>{parsedOptions[flashcard.correct_option ?? 0]}</strong>
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Continue button after answering -->
		{#if showResult}
			<div class="w-full max-w-2xl mt-8">
				<Button
					variant="primary"
					onclick={() => handleAnswer(isAnswerCorrect ? 5 : 0)}
					className="w-full"
				>
					{$_('flashcards.next_card')}
					<Icon name="chevronRight" size={18} />
				</Button>
			</div>
		{/if}
	{:else}
		<!-- Standard Flip Card -->
		<div class="perspective-1000 w-full max-w-2xl">
			<button
				class="flashcard-container w-full h-80 relative cursor-pointer"
				class:flipped={isFlipped}
				onclick={handleFlip}
				type="button"
			>
				<!-- Front of card -->
				<div class="flashcard-face flashcard-front">
					<div class="absolute top-4 left-4">
						<span class="text-xs font-medium text-accent-primary bg-accent-primary/10 px-3 py-1.5 rounded-full">
							{$_('flashcards.front')}
						</span>
					</div>
					<div class="flex flex-col items-center justify-center h-full px-8">
						<p class="text-2xl font-medium text-light-text-primary dark:text-dark-text-primary text-center mb-6">
							{flashcard.front_text}
						</p>
						<div class="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary text-sm">
							<Icon name="layers" size={16} />
							<span>{$_('flashcards.click_to_reveal')}</span>
						</div>
					</div>
				</div>

				<!-- Back of card -->
				<div class="flashcard-face flashcard-back">
					<div class="absolute top-4 left-4">
						<span class="text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
							{$_('flashcards.back')}
						</span>
					</div>
					<div class="flex flex-col items-center justify-center h-full px-8">
						<p class="text-2xl font-medium text-light-text-primary dark:text-dark-text-primary text-center">
							{flashcard.back_text}
						</p>
					</div>
				</div>
			</button>
		</div>

		<!-- Answer buttons (only visible when flipped) -->
		{#if isFlipped}
			<div class="w-full max-w-2xl mt-8 space-y-4 answer-buttons">
				<p class="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
					{$_('flashcards.rate_your_knowledge')}
				</p>
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
					<!-- Quality 0 - Complete blackout -->
					<button
						type="button"
						onclick={() => handleAnswer(0)}
						class="quality-btn quality-0 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">0</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_0')}</span>
					</button>
					<!-- Quality 1 - Wrong, then remembered -->
					<button
						type="button"
						onclick={() => handleAnswer(1)}
						class="quality-btn quality-1 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">1</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_1')}</span>
					</button>
					<!-- Quality 2 - Wrong, but seemed easy -->
					<button
						type="button"
						onclick={() => handleAnswer(2)}
						class="quality-btn quality-2 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">2</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_2')}</span>
					</button>
					<!-- Quality 3 - Correct with difficulty -->
					<button
						type="button"
						onclick={() => handleAnswer(3)}
						class="quality-btn quality-3 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">3</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_3')}</span>
					</button>
					<!-- Quality 4 - Correct after hesitation -->
					<button
						type="button"
						onclick={() => handleAnswer(4)}
						class="quality-btn quality-4 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">4</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_4')}</span>
					</button>
					<!-- Quality 5 - Perfect -->
					<button
						type="button"
						onclick={() => handleAnswer(5)}
						class="quality-btn quality-5 flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
					>
						<span class="text-lg font-bold">5</span>
						<span class="text-xs font-medium">{$_('flashcards.quality_5')}</span>
					</button>
				</div>
				<!-- Legend/hint on desktop -->
				<p class="text-center text-xs text-light-text-secondary dark:text-dark-text-secondary hidden sm:block">
					0-2: {$_('flashcards.incorrect')} • 3-5: {$_('flashcards.correct')}
				</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
		isolation: isolate;
	}

	.flashcard-container {
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.flashcard-container.flipped {
		transform: rotateY(180deg);
	}

	.flashcard-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: 1rem;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		@apply bg-light-bg-primary dark:bg-dark-bg-primary border-2 border-light-border-primary dark:border-dark-border-primary;
	}

	.flashcard-front {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
	}

	.flashcard-back {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
		transform: rotateY(180deg);
	}

	.flashcard-container:hover .flashcard-face {
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}

	/* Ensure answer buttons are clickable and above the 3D transformed card */
	.answer-buttons {
		position: relative;
		z-index: 100;
		isolation: isolate;
	}

	/* Quality rating button styles */
	.quality-btn {
		border: 2px solid transparent;
		cursor: pointer;
	}

	.quality-0 {
		background: rgba(239, 68, 68, 0.15);
		color: rgb(220, 38, 38);
		border-color: rgba(239, 68, 68, 0.3);
	}
	.quality-0:hover {
		background: rgba(239, 68, 68, 0.25);
		border-color: rgb(239, 68, 68);
	}

	.quality-1 {
		background: rgba(249, 115, 22, 0.15);
		color: rgb(234, 88, 12);
		border-color: rgba(249, 115, 22, 0.3);
	}
	.quality-1:hover {
		background: rgba(249, 115, 22, 0.25);
		border-color: rgb(249, 115, 22);
	}

	.quality-2 {
		background: rgba(245, 158, 11, 0.15);
		color: rgb(217, 119, 6);
		border-color: rgba(245, 158, 11, 0.3);
	}
	.quality-2:hover {
		background: rgba(245, 158, 11, 0.25);
		border-color: rgb(245, 158, 11);
	}

	.quality-3 {
		background: rgba(132, 204, 22, 0.15);
		color: rgb(101, 163, 13);
		border-color: rgba(132, 204, 22, 0.3);
	}
	.quality-3:hover {
		background: rgba(132, 204, 22, 0.25);
		border-color: rgb(132, 204, 22);
	}

	.quality-4 {
		background: rgba(34, 197, 94, 0.15);
		color: rgb(22, 163, 74);
		border-color: rgba(34, 197, 94, 0.3);
	}
	.quality-4:hover {
		background: rgba(34, 197, 94, 0.25);
		border-color: rgb(34, 197, 94);
	}

	.quality-5 {
		background: rgba(16, 185, 129, 0.15);
		color: rgb(5, 150, 105);
		border-color: rgba(16, 185, 129, 0.3);
	}
	.quality-5:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgb(16, 185, 129);
	}

	/* Dark mode adjustments */
	:global(.dark) .quality-0 {
		color: rgb(248, 113, 113);
	}
	:global(.dark) .quality-1 {
		color: rgb(251, 146, 60);
	}
	:global(.dark) .quality-2 {
		color: rgb(251, 191, 36);
	}
	:global(.dark) .quality-3 {
		color: rgb(163, 230, 53);
	}
	:global(.dark) .quality-4 {
		color: rgb(74, 222, 128);
	}
	:global(.dark) .quality-5 {
		color: rgb(52, 211, 153);
	}
</style>
