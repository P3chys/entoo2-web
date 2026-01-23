<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import { debounce, transformMeilisearchHit, FILE_TYPE_FILTERS } from '$lib/utils/search';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchResultCard from '$lib/components/SearchResultCard.svelte';
	import Icon from '$components/Icon.svelte';
	import { fadeSlideIn, staggerFadeIn, bounceIn } from '$lib/utils/animation';
	import type { SearchResult, Subject, MeilisearchHit } from '$types';

	let searchQuery = $state('');
	let subjectFilter = $state('');
	let typeFilter = $state<'all' | 'documents' | 'subjects'>('all');
	let mimeTypeFilter = $state('');
	let exactMatch = $state(false);
	let documentResults = $state<SearchResult[]>([]);
	let subjectResults = $state<SearchResult[]>([]);
	let documentCount = $state(0);
	let subjectCount = $state(0);
	let loading = $state(false);
	let error = $state('');
	let subjects = $state<Subject[]>([]);
	let showAdvancedFilters = $state(false);

	const allResults = $derived([...documentResults, ...subjectResults]);
	const filteredResults = $derived(filterResults());

	async function loadSubjects() {
		const { data } = await api.get<{ success: boolean; data: Subject[] }>('/api/v1/subjects');
		if (data?.success) {
			subjects = data.data || [];
		}
	}

	async function performSearch(query: string) {
		if (!query.trim()) {
			documentResults = [];
			subjectResults = [];
			documentCount = 0;
			subjectCount = 0;
			return;
		}

		loading = true;
		error = '';

		const { data, error: apiError } = await api.search(query, {
			subject_id: subjectFilter || undefined,
			type: typeFilter,
			mime_type: mimeTypeFilter || undefined,
			exact: exactMatch
		});

		if (apiError) {
			error = apiError.message;
			documentResults = [];
			subjectResults = [];
			documentCount = 0;
			subjectCount = 0;
		} else if (data?.success && data.data) {
			// Handle new response format with separate documents and subjects
			const docs = data.data.documents as unknown as MeilisearchHit[] || [];
			const subs = data.data.subjects as unknown as MeilisearchHit[] || [];

			documentResults = docs.map(transformMeilisearchHit);
			subjectResults = subs.map(transformMeilisearchHit);
			documentCount = data.data.documents_count || docs.length;
			subjectCount = data.data.subjects_count || subs.length;
		}

		loading = false;
	}

	const debouncedSearch = debounce(performSearch, 300);

	function handleSearchInput(value: string) {
		searchQuery = value;
		updateURL();
		debouncedSearch(value);
	}

	function handleSearchSubmit(value: string) {
		searchQuery = value;
		updateURL();
		performSearch(value);
	}

	function updateURL() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (subjectFilter) params.set('subject_id', subjectFilter);
		if (typeFilter !== 'all') params.set('type', typeFilter);
		if (mimeTypeFilter) params.set('mime_type', mimeTypeFilter);
		if (exactMatch) params.set('exact', 'true');

		const url = params.toString() ? `/search?${params.toString()}` : '/search';
		goto(url, { replaceState: true, noScroll: true });
	}

	function filterResults(): SearchResult[] {
		if (typeFilter === 'all') {
			return allResults;
		} else if (typeFilter === 'documents') {
			return documentResults;
		} else {
			return subjectResults;
		}
	}

	function handleSubjectFilterChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		subjectFilter = target.value;
		updateURL();
		if (searchQuery) {
			performSearch(searchQuery);
		}
	}

	function handleTypeFilterChange(newType: typeof typeFilter) {
		typeFilter = newType;
		updateURL();
	}

	function handleMimeTypeFilterChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		mimeTypeFilter = target.value;
		updateURL();
		if (searchQuery) {
			performSearch(searchQuery);
		}
	}

	function handleExactMatchToggle() {
		exactMatch = !exactMatch;
		updateURL();
		if (searchQuery) {
			performSearch(searchQuery);
		}
	}

	function toggleAdvancedFilters() {
		showAdvancedFilters = !showAdvancedFilters;
	}

	onMount(() => {
		loadSubjects();

		const q = $page.url.searchParams.get('q');
		const sid = $page.url.searchParams.get('subject_id');
		const type = $page.url.searchParams.get('type') as typeof typeFilter;
		const mime = $page.url.searchParams.get('mime_type');
		const exact = $page.url.searchParams.get('exact') === 'true';

		if (q) searchQuery = q;
		if (sid) subjectFilter = sid;
		if (type) typeFilter = type;
		if (mime) mimeTypeFilter = mime;
		if (exact) exactMatch = exact;

		if (searchQuery) {
			performSearch(searchQuery);
		}
	});
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Header -->
	<div use:fadeSlideIn>
		<h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
			<Icon name="search" size={32} className="text-accent-primary" />
			{$_('common.search')}
		</h1>
		<p class="text-light-text-secondary dark:text-dark-text-secondary">
			{$_('search.placeholder')}
		</p>
	</div>

	<!-- Search Input -->
	<div use:fadeSlideIn={{ delay: 100 }}>
		<SearchBar
			bind:value={searchQuery}
			{loading}
			autofocus={true}
			onInput={handleSearchInput}
			onSubmit={handleSearchSubmit}
		/>
	</div>

	<!-- Filters -->
	<div class="space-y-4" use:fadeSlideIn={{ delay: 200 }}>
		<!-- Main Filters -->
		<div class="flex flex-wrap gap-4 items-center">
			<!-- Type Filter -->
			<div class="flex gap-2">
				<button
					onclick={() => handleTypeFilterChange('all')}
					class="btn btn-sm {typeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}"
				>
					{$_('search.allResults')}
					{#if typeFilter === 'all' && (documentCount > 0 || subjectCount > 0)}
						<span class="ml-1 opacity-75">({documentCount + subjectCount})</span>
					{/if}
				</button>
				<button
					onclick={() => handleTypeFilterChange('documents')}
					class="btn btn-sm {typeFilter === 'documents' ? 'btn-primary' : 'btn-ghost'}"
				>
					{$_('search.documentsOnly')}
					{#if documentCount > 0}
						<span class="ml-1 opacity-75">({documentCount})</span>
					{/if}
				</button>
				<button
					onclick={() => handleTypeFilterChange('subjects')}
					class="btn btn-sm {typeFilter === 'subjects' ? 'btn-primary' : 'btn-ghost'}"
				>
					{$_('search.subjectsOnly')}
					{#if subjectCount > 0}
						<span class="ml-1 opacity-75">({subjectCount})</span>
					{/if}
				</button>
			</div>

			<!-- Advanced Filters Toggle -->
			<button
				onclick={toggleAdvancedFilters}
				class="btn btn-sm btn-ghost"
				aria-expanded={showAdvancedFilters}
			>
				<Icon name={showAdvancedFilters ? 'chevron-up' : 'chevron-down'} size={16} />
				Advanced Filters
			</button>
		</div>

		<!-- Advanced Filters -->
		{#if showAdvancedFilters}
			<div class="flex flex-wrap gap-4 items-center p-4 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary" in:fade={{ duration: 200 }}>
				<!-- Subject Filter -->
				<div class="flex flex-col gap-1">
					<label for="subject-filter" class="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
						Subject
					</label>
					<select
						id="subject-filter"
						bind:value={subjectFilter}
						onchange={handleSubjectFilterChange}
						class="input input-sm"
					>
						<option value="">{$_('search.allSubjects')}</option>
						{#each subjects as subject}
							<option value={subject.id}>{subject.code} - {subject.name_cs}</option>
						{/each}
					</select>
				</div>

				<!-- File Type Filter -->
				{#if typeFilter === 'all' || typeFilter === 'documents'}
					<div class="flex flex-col gap-1">
						<label for="mime-filter" class="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
							File Type
						</label>
						<select
							id="mime-filter"
							bind:value={mimeTypeFilter}
							onchange={handleMimeTypeFilterChange}
							class="input input-sm"
						>
							{#each FILE_TYPE_FILTERS as filter}
								<option value={filter.mimeType}>
									{filter.icon} {filter.label}
								</option>
							{/each}
						</select>
					</div>
				{/if}

				<!-- Exact Match Toggle -->
				<div class="flex flex-col gap-1">
					<label for="exact-match" class="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
						Search Mode
					</label>
					<button
						id="exact-match"
						onclick={handleExactMatchToggle}
						class="btn btn-sm {exactMatch ? 'btn-primary' : 'btn-ghost'}"
					>
						<Icon name={exactMatch ? 'check-square' : 'square'} size={16} />
						Exact Match
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Results -->
	{#if loading && filteredResults.length === 0}
		<div class="text-center py-12">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"
			></div>
			<p class="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
				{$_('search.searching')}
			</p>
		</div>
	{:else if error}
		<div class="bg-error/10 text-error p-4 rounded-lg">
			{error}
		</div>
	{:else if searchQuery && filteredResults.length === 0}
		<!-- No Results -->
		<div class="text-center py-12">
			<svg
				class="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<h3 class="text-lg font-semibold mb-2">{$_('search.noResults')}</h3>
			<p class="text-light-text-secondary dark:text-dark-text-secondary mb-4">
				{$_('search.noResultsFor', { values: { query: searchQuery } })}
			</p>
			<ul
				class="text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-left max-w-md mx-auto"
			>
				<li>{$_('search.tipSpelling')}</li>
				<li>{$_('search.tipKeywords')}</li>
				<li>{$_('search.tipFilters')}</li>
			</ul>
		</div>
	{:else if filteredResults.length > 0}
		<!-- Results List -->
		<div class="space-y-4" in:fade={{ duration: 300 }}>
			<div class="flex items-center justify-between" use:bounceIn>
				<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">
					<Icon name="check" size={16} className="inline text-success" />
					{$_('search.found')}{filteredResults.length}{filteredResults.length === 1 ? $_('search.result') : $_('search.results_plural')}
				</p>
			</div>

			<div use:staggerFadeIn>
				{#each filteredResults as result (result.id)}
					<SearchResultCard {result} query={searchQuery} />
				{/each}
			</div>
		</div>
	{:else}
		<!-- Empty State -->
		<div class="text-center py-12">
			<svg
				class="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<h3 class="text-lg font-semibold mb-2">{$_('search.emptyTitle')}</h3>
			<p class="text-light-text-secondary dark:text-dark-text-secondary">
				{$_('search.emptyDescription')}
			</p>
		</div>
	{/if}
</div>

<style>
	:global(.search-highlight) {
		@apply bg-yellow-200 dark:bg-yellow-800 font-medium;
	}

	:global(.line-clamp-2) {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
