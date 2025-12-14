<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import { debounce, transformMeilisearchHit } from '$lib/utils/search';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SearchResultCard from '$lib/components/SearchResultCard.svelte';
	import type { SearchResult, Subject, MeilisearchHit } from '$types';

	let searchQuery = $state('');
	let subjectFilter = $state('');
	let typeFilter = $state<'all' | 'documents' | 'subjects'>('all');
	let results = $state<SearchResult[]>([]);
	let filteredResults = $derived(filterResults(results));
	let loading = $state(false);
	let error = $state('');
	let subjects = $state<Subject[]>([]);

	async function loadSubjects() {
		const { data } = await api.get<{ success: boolean; data: Subject[] }>('/api/v1/subjects');
		if (data?.success) {
			subjects = data.data || [];
		}
	}

	async function performSearch(query: string) {
		if (!query.trim()) {
			results = [];
			return;
		}

		loading = true;
		error = '';

		const { data, error: apiError } = await api.search(query, {
			subject_id: subjectFilter || undefined
		});

		if (apiError) {
			error = apiError.message;
			results = [];
		} else if (data?.success) {
			results = (data.data as unknown as MeilisearchHit[]).map(transformMeilisearchHit);
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

		const url = params.toString() ? `/search?${params.toString()}` : '/search';
		goto(url, { replaceState: true, noScroll: true });
	}

	function filterResults(allResults: SearchResult[]): SearchResult[] {
		if (typeFilter === 'all') return allResults;
		return allResults.filter((r) => r.type === typeFilter.replace('s', '') as any);
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

	onMount(() => {
		loadSubjects();

		const q = $page.url.searchParams.get('q');
		const sid = $page.url.searchParams.get('subject_id');
		const type = $page.url.searchParams.get('type') as typeof typeFilter;

		if (q) searchQuery = q;
		if (sid) subjectFilter = sid;
		if (type) typeFilter = type;

		if (searchQuery) {
			performSearch(searchQuery);
		}
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold mb-2">{$_('common.search')}</h1>
		<p class="text-light-text-secondary dark:text-dark-text-secondary">
			{$_('search.placeholder')}
		</p>
	</div>

	<!-- Search Input -->
	<SearchBar
		bind:value={searchQuery}
		{loading}
		autofocus={true}
		onInput={handleSearchInput}
		onSubmit={handleSearchSubmit}
	/>

	<!-- Filters -->
	<div class="flex flex-wrap gap-4 items-center">
		<!-- Subject Filter -->
		<div>
			<label for="subject-filter" class="sr-only">{$_('subjects.semester')}</label>
			<select
				id="subject-filter"
				bind:value={subjectFilter}
				onchange={handleSubjectFilterChange}
				class="input"
			>
				<option value="">{$_('search.allSubjects')}</option>
				{#each subjects as subject}
					<option value={subject.id}>{subject.code} - {subject.name_en}</option>
				{/each}
			</select>
		</div>

		<!-- Type Filter -->
		<div class="flex gap-2">
			<button
				onclick={() => handleTypeFilterChange('all')}
				class="btn btn-sm {typeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}"
			>
				{$_('search.allResults')}
			</button>
			<button
				onclick={() => handleTypeFilterChange('documents')}
				class="btn btn-sm {typeFilter === 'documents' ? 'btn-primary' : 'btn-ghost'}"
			>
				{$_('search.documentsOnly')}
			</button>
			<button
				onclick={() => handleTypeFilterChange('subjects')}
				class="btn btn-sm {typeFilter === 'subjects' ? 'btn-primary' : 'btn-ghost'}"
			>
				{$_('search.subjectsOnly')}
			</button>
		</div>
	</div>

	<!-- Results -->
	{#if loading && results.length === 0}
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
				No results found for "{searchQuery}"
			</p>
			<ul
				class="text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-left max-w-md mx-auto"
			>
				<li>Try checking your spelling</li>
				<li>Use different keywords</li>
				<li>Remove filters to see more results</li>
			</ul>
		</div>
	{:else if filteredResults.length > 0}
		<!-- Results List -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
					Found {filteredResults.length}
					{filteredResults.length === 1 ? 'result' : 'results'}
				</p>
			</div>

			{#each filteredResults as result (result.id)}
				<SearchResultCard {result} query={searchQuery} />
			{/each}
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
			<h3 class="text-lg font-semibold mb-2">Search across documents and subjects</h3>
			<p class="text-light-text-secondary dark:text-dark-text-secondary">
				Start typing to find files, content, and courses
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
