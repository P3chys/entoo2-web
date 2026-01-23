<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { fade } from 'svelte/transition';
	import Icon from '$components/Icon.svelte';
	import { goto } from '$app/navigation';
	import type { Subject, Document } from '$types';
	import Button from '$components/Button.svelte';

	let favoriteSubjects: Subject[] = $state([]);
	let favoriteDocuments: Document[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	async function loadFavorites() {
		loading = true;
		error = '';
		
		const response = await api.get<{ 
			success: boolean; 
			data: { 
				subjects: Subject[]; 
				documents: Document[]; 
			} 
		}>('/api/v1/favorites');

		if (response.error) {
			error = response.error.message || $_('common.failed_to_load_favorites');
		} else if (response.data?.success) {
			favoriteSubjects = response.data.data.subjects || [];
			favoriteDocuments = response.data.data.documents || [];
		}

		loading = false;
	}

	async function toggleFavoriteSubject(subject: Subject) {
		// Optimistic update - remove from list immediately
		const originalList = [...favoriteSubjects];
		favoriteSubjects = favoriteSubjects.filter(s => s.id !== subject.id);

		const { error } = await api.post<{ success: boolean; is_favorite: boolean }>(`/api/v1/subjects/${subject.id}/favorite`, {});

		if (error) {
			// Revert if failed
			favoriteSubjects = originalList;
			alert(error.message || $_('common.failed_to_remove_favorite'));
		}
	}

	async function removeFavoriteDocument(doc: Document) {
		// Optimistic update - remove from list immediately
		const originalList = [...favoriteDocuments];
		favoriteDocuments = favoriteDocuments.filter(d => d.id !== doc.id);

		const { error } = await api.post<{ success: boolean; is_favorite: boolean }>(`/api/v1/documents/${doc.id}/favorite`, {});

		if (error) {
			// Revert if failed
			favoriteDocuments = originalList;
			alert(error.message || $_('common.failed_to_remove_favorite'));
		}
	}

	onMount(() => {
		loadFavorites();
	});
</script>

<div class="space-y-8" in:fade={{ duration: 200 }}>
	<div class="flex items-center gap-3">
		<h1 class="text-3xl font-bold">{$_('favorites.title')}</h1>
		<Icon name="star" size={32} className="text-yellow-400 fill-yellow-400" />
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
			<button class="ml-4 underline" onclick={loadFavorites}>Retry</button>
		</div>
	{:else if favoriteSubjects.length === 0 && favoriteDocuments.length === 0}
		<div class="text-center py-16 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 mb-4">
				<Icon name="star" size={32} className="text-surface-400" />
			</div>
			<h3 class="text-xl font-semibold mb-2">{$_('favorites.noFavoritesTitle')}</h3>
			<p class="text-surface-600 dark:text-surface-400 max-w-md mx-auto mb-6">
				{$_('favorites.noFavoritesDesc')}
			</p>
			<div class="flex justify-center gap-4">
				<a href="/subjects">
					<Button variant="primary">{$_('favorites.browseSubjects')}</Button>
				</a>
			</div>
		</div>
	{:else}
		<!-- Favorite Subjects -->
		{#if favoriteSubjects.length > 0}
			<section>
				<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
					<Icon name="book" size={24} />
					{$_('favorites.favoriteSubjects')}
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each favoriteSubjects as subject (subject.id)}
						<div 
							class="bg-surface-50 dark:bg-surface-800 rounded-lg p-5 border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
							role="button"
							tabindex="0"
							onclick={() => goto(`/subjects/${subject.id}`)}
                            onkeydown={(e) => e.key === 'Enter' && goto(`/subjects/${subject.id}`)}
						>
							<div class="flex justify-between items-start">
								<div>
									<div class="flex items-center gap-2 mb-2">
										<span class="font-mono font-bold bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded text-xs">
											{subject.code}
										</span>
									</div>
									<h3 class="font-bold text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
										{subject.name_cs}
									</h3>
									<p class="text-sm text-surface-500 dark:text-surface-400">
										{subject.credits} kr.
									</p>
								</div>
								<button 
									class="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full transition-colors z-10"
									onclick={(e) => { e.stopPropagation(); toggleFavoriteSubject(subject); }}
									title="Remove from favorites"
								>
									<Icon name="star" size={20} className="text-yellow-400 fill-yellow-400" />
								</button>
							</div>
                            {#if subject.semester}
                                <div class="mt-4 text-xs text-surface-500 border-t border-surface-200 dark:border-surface-700 pt-2">
                                    {subject.semester.name_cs}
                                </div>
                            {/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Favorite Documents -->
		{#if favoriteDocuments.length > 0}
			<section>
				<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
					<Icon name="file-text" size={24} />
					{$_('favorites.favoriteDocuments')}
				</h2>
				<div class="bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
					<div class="space-y-2">
						{#each favoriteDocuments as doc (doc.id)}
							<div class="flex items-center justify-between p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg hover:shadow-md transition-shadow">
								<div class="flex items-center gap-3 flex-1 min-w-0">
									<Icon name="document" size={20} className="text-accent-primary flex-shrink-0" />
									<div class="flex-1 min-w-0">
										<div class="font-medium truncate">{doc.original_name}</div>
										{#if doc.subject}
											<div class="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
												{doc.subject.code} - {doc.subject.name_cs}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2 flex-shrink-0">
									<a
										href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/documents/${doc.id}/download`}
										class="btn btn-ghost btn-sm"
										title={$_('common.download')}
									>
										<Icon name="download" size={16} />
									</a>
									<button
										class="btn btn-ghost btn-sm"
										onclick={() => removeFavoriteDocument(doc)}
										title={$_('favorites.removeFromFavorites')}
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-yellow-400">
											<path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	{/if}
</div>
