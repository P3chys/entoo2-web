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
	import Input from '$components/Input.svelte';
	import LoadingSpinner from '$components/LoadingSpinner.svelte';
	import type { FlashcardDeck } from '$lib/types';
	import { fadeSlideIn } from '$lib/utils/animation';

	const deckId = $page.params.id;

	let deck: FlashcardDeck | null = $state(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');

	// Form fields
	let title = $state('');
	let description = $state('');
	let isPublic = $state(false);

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
			title = deck.title;
			description = deck.description;
			isPublic = deck.is_public;
		}

		loading = false;
	}

	async function handleSave() {
		if (!title.trim()) return;

		saving = true;
		error = '';

		const { error: err } = await api.put(`/api/v1/decks/${deckId}`, {
			title: title.trim(),
			description: description.trim(),
			is_public: isPublic
		});

		saving = false;

		if (err) {
			error = err.message || $_('common.error');
		} else {
			// Navigate back to deck detail
			goto(`/decks/${deckId}`);
		}
	}

	function handleCancel() {
		goto(`/decks/${deckId}`);
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
	{:else if error && !deck}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
		</div>
	{:else if deck}
		{#if !isOwner}
			<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
				{$_('flashcards.no_permission_edit')}
			</div>
		{:else}
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

			<!-- Header -->
			<div class="mb-6" use:fadeSlideIn={{ delay: 100 }}>
				<h1
					class="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3"
				>
					<Icon name="edit" size={32} className="text-accent-primary" />
					{$_('flashcards.edit_deck')}
				</h1>
			</div>

			<!-- Form -->
			<div class="card p-6 space-y-6 max-w-2xl" use:fadeSlideIn={{ delay: 200 }}>
				<!-- Title -->
				<div>
					<label
						class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
					>
						{$_('flashcards.deck_title')} <span class="text-red-500">*</span>
					</label>
					<Input bind:value={title} placeholder={$_('flashcards.deck_title_placeholder')} maxlength={200} />
					<div class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 text-right">
						{title.length} / 200
					</div>
				</div>

				<!-- Description -->
				<div>
					<label
						class="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
					>
						{$_('flashcards.deck_description')}
					</label>
					<textarea
						bind:value={description}
						class="w-full px-4 py-3 border border-light-border-primary dark:border-dark-border-primary rounded-lg
							   bg-light-bg-secondary dark:bg-dark-bg-secondary
							   text-light-text-primary dark:text-dark-text-primary
							   focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent
							   resize-none"
						rows="4"
						placeholder={$_('flashcards.deck_description_placeholder')}
					></textarea>
				</div>

				<!-- Public Toggle -->
				<div>
					<label class="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="checkbox"
							bind:checked={isPublic}
							class="rounded border-light-border-primary dark:border-dark-border-primary"
						/>
						<span class="font-medium text-light-text-primary dark:text-dark-text-primary">
							{$_('flashcards.make_public')}
						</span>
					</label>
					<p class="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 ml-6">
						{$_('flashcards.public_description')}
					</p>
				</div>

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
				<div class="flex gap-3 justify-end pt-4 border-t border-light-border-primary dark:border-dark-border-primary">
					<Button variant="ghost" onclick={handleCancel} disabled={saving}>
						{$_('common.cancel')}
					</Button>
					<Button onclick={handleSave} disabled={!title.trim() || saving} loading={saving}>
						{$_('common.save_changes')}
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>
