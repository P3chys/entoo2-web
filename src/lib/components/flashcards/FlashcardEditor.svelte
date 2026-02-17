<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import type { Flashcard, CardType } from '$lib/types';

	interface Props {
		flashcard?: Partial<Flashcard>;
		onSave: (card: Partial<Flashcard>) => Promise<void>;
		onCancel: () => void;
	}

	let { flashcard = {}, onSave, onCancel }: Props = $props();

	let cardType = $state<CardType>((flashcard.card_type as CardType) || 'standard');
	let frontText = $state(flashcard.front_text || '');
	let backText = $state(flashcard.back_text || '');
	let options = $state<string[]>(
		flashcard.options ? JSON.parse(flashcard.options) : ['', '', '', '']
	);
	let correctOption = $state(flashcard.correct_option ?? 0);
	let saving = $state(false);
	let error = $state('');

	const isStandardValid = $derived(frontText.trim().length > 0 && backText.trim().length > 0);
	const isMultipleChoiceValid = $derived(
		frontText.trim().length > 0 &&
			options.filter((o) => o.trim().length > 0).length >= 2 &&
			correctOption >= 0 &&
			correctOption < options.length &&
			options[correctOption]?.trim().length > 0
	);
	const isValid = $derived(cardType === 'standard' ? isStandardValid : isMultipleChoiceValid);

	async function handleSave() {
		if (!isValid) return;

		error = '';
		saving = true;

		try {
			const cardData: Partial<Flashcard> = {
				...flashcard,
				card_type: cardType,
				front_text: frontText.trim(),
				back_text: cardType === 'standard' ? backText.trim() : options[correctOption]?.trim() || ''
			};

			if (cardType === 'multiple_choice') {
				cardData.options = JSON.stringify(options.filter((o) => o.trim().length > 0));
				cardData.correct_option = correctOption;
			}

			await onSave(cardData);
		} catch (err: any) {
			error = err.message || $_('common.error');
		} finally {
			saving = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		} else if (e.key === 'Enter' && e.ctrlKey && isValid) {
			handleSave();
		}
	}

	function addOption() {
		if (options.length < 6) {
			options = [...options, ''];
		}
	}

	function removeOption(index: number) {
		if (options.length > 2) {
			options = options.filter((_, i) => i !== index);
			if (correctOption >= options.length) {
				correctOption = options.length - 1;
			}
		}
	}

	function updateOption(index: number, value: string) {
		options = options.map((o, i) => (i === index ? value : o));
	}
</script>

<div class="card p-6 space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between mb-2">
		<h3
			class="text-lg font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2"
		>
			<Icon name="edit" size={20} className="text-accent-primary" />
			{flashcard.id ? $_('flashcards.edit_card') : $_('flashcards.add_card')}
		</h3>
		<button
			class="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-full p-1 transition-colors"
			onclick={onCancel}
			aria-label={$_('common.cancel')}
		>
			<Icon name="x" size={20} />
		</button>
	</div>

	<!-- Card Type Selector -->
	<div class="flex gap-2 p-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
		<button
			class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2
				   {cardType === 'standard'
				? 'bg-white dark:bg-dark-bg-secondary text-accent-primary shadow-sm'
				: 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}"
			onclick={() => (cardType = 'standard')}
		>
			<Icon name="file-text" size={16} />
			{$_('flashcards.standard_card')}
		</button>
		<button
			class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2
				   {cardType === 'multiple_choice'
				? 'bg-white dark:bg-dark-bg-secondary text-accent-primary shadow-sm'
				: 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}"
			onclick={() => (cardType = 'multiple_choice')}
		>
			<Icon name="list" size={16} />
			{$_('flashcards.multiple_choice')}
		</button>
	</div>

	<!-- Front Side / Question -->
	<div>
		<label
			class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
		>
			{$_('flashcards.front_question')}
			<span class="text-red-500">*</span>
		</label>
		<textarea
			bind:value={frontText}
			onkeydown={handleKeyDown}
			class="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-lg
				   bg-light-bg-secondary dark:bg-dark-bg-secondary
				   text-light-text-primary dark:text-dark-text-primary
				   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
				   resize-none transition-all"
			rows="3"
			placeholder={$_('flashcards.front_placeholder')}
			maxlength="5000"
		></textarea>
		<div class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 text-right">
			{frontText.length} / 5000
		</div>
	</div>

	{#if cardType === 'standard'}
		<!-- Back Side (Standard Card) -->
		<div>
			<label
				class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
			>
				{$_('flashcards.back_answer')}
				<span class="text-red-500">*</span>
			</label>
			<textarea
				bind:value={backText}
				onkeydown={handleKeyDown}
				class="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-lg
					   bg-light-bg-secondary dark:bg-dark-bg-secondary
					   text-light-text-primary dark:text-dark-text-primary
					   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
					   resize-none transition-all"
				rows="5"
				placeholder={$_('flashcards.back_placeholder')}
				maxlength="5000"
			></textarea>
			<div class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 text-right">
				{backText.length} / 5000
			</div>
		</div>
	{:else}
		<!-- Multiple Choice Options -->
		<div>
			<label
				class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
			>
				{$_('flashcards.options')}
				<span class="text-red-500">*</span>
				<span class="text-light-text-secondary dark:text-dark-text-secondary font-normal ml-2">
					({$_('flashcards.select_correct')})
				</span>
			</label>
			<div class="space-y-2">
				{#each options as option, index}
					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => (correctOption = index)}
							class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
								   {correctOption === index
								? 'border-green-500 bg-green-500 text-white'
								: 'border-light-border-primary dark:border-dark-border-primary hover:border-green-400'}"
							title={$_('flashcards.mark_correct')}
						>
							{#if correctOption === index}
								<Icon name="check" size={14} />
							{/if}
						</button>
						<input
							type="text"
							value={option}
							oninput={(e) => updateOption(index, e.currentTarget.value)}
							onkeydown={handleKeyDown}
							class="flex-1 px-4 py-2 border border-light-border-primary dark:border-dark-border-primary rounded-lg
								   bg-light-bg-secondary dark:bg-dark-bg-secondary
								   text-light-text-primary dark:text-dark-text-primary
								   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
								   transition-all {correctOption === index ? 'ring-2 ring-green-500/30' : ''}"
							placeholder="{$_('flashcards.option')} {index + 1}"
							maxlength="500"
						/>
						{#if options.length > 2}
							<button
								type="button"
								onclick={() => removeOption(index)}
								class="p-2 text-light-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
								title={$_('common.delete')}
							>
								<Icon name="trash" size={16} />
							</button>
						{/if}
					</div>
				{/each}
			</div>
			{#if options.length < 6}
				<button
					type="button"
					onclick={addOption}
					class="mt-2 text-sm text-accent-primary hover:text-accent-primary/80 flex items-center gap-1"
				>
					<Icon name="plus" size={14} />
					{$_('flashcards.add_option')}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div
			class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2"
		>
			<Icon name="alert" size={16} />
			{error}
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex gap-3 justify-end pt-2">
		<Button variant="ghost" onclick={onCancel} disabled={saving}>
			{$_('common.cancel')}
		</Button>
		<Button onclick={handleSave} disabled={!isValid || saving} loading={saving}>
			{#if saving}
				{$_('common.saving')}
			{:else if flashcard.id}
				{$_('common.save_changes')}
			{:else}
				{$_('flashcards.add_card')}
			{/if}
		</Button>
	</div>

	<!-- Keyboard Hints -->
	<div
		class="text-xs text-light-text-secondary dark:text-dark-text-secondary text-center pt-2 border-t border-light-border-primary dark:border-dark-border-primary"
	>
		<span class="inline-flex items-center gap-1">
			<kbd class="px-2 py-0.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded">Ctrl</kbd> +
			<kbd class="px-2 py-0.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded">Enter</kbd>
			{$_('flashcards.to_save')}
		</span>
		<span class="mx-2">•</span>
		<span class="inline-flex items-center gap-1">
			<kbd class="px-2 py-0.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded">Esc</kbd>
			{$_('common.to_cancel')}
		</span>
	</div>
</div>
