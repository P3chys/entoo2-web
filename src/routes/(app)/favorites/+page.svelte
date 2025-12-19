<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { fade } from 'svelte/transition';
	import Icon from '$components/Icon.svelte';
	import DocumentList from '$components/DocumentList.svelte';
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
			error = response.error.message || 'Failed to load favorites';
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
			alert(error.message || 'Failed to remove favorite');
		} else {
             // Success - no action needed as item is already removed
        }
	}

	function handleDocumentDelete(docId: string) {
		// Should not happen on favorites page usually, but if we allow delete
		// Reloading list or removing item
		favoriteDocuments = favoriteDocuments.filter(d => d.id !== docId);
	}

     // If DocumentList removes favorite, we should remove it from view
    async function refreshData() {
        await loadFavorites();
    }

	onMount(() => {
		loadFavorites();
	});
</script>

<div class="space-y-8" in:fade={{ duration: 200 }}>
	<div class="flex items-center gap-3">
		<h1 class="text-3xl font-bold">Favorites</h1>
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
			<h3 class="text-xl font-semibold mb-2">No Favorites Yet</h3>
			<p class="text-surface-600 dark:text-surface-400 max-w-md mx-auto mb-6">
				Mark subjects and documents as favorites to access them quickly from this page.
			</p>
			<div class="flex justify-center gap-4">
				<a href="/subjects">
					<Button variant="primary">Browse Subjects</Button>
				</a>
			</div>
		</div>
	{:else}
		<!-- Favorite Subjects -->
		{#if favoriteSubjects.length > 0}
			<section>
				<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
					<Icon name="book" size={24} />
					Favorite Subjects
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
										{subject.name_en}
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
                                    {subject.semester.name_en}
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
					Favorite Documents
				</h2>
				<div class="bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
					<DocumentList 
						documents={favoriteDocuments} 
						subjectId="" 
                        onDelete={handleDocumentDelete}
					/>
				</div>
			</section>
		{/if}
	{/if}
</div>
