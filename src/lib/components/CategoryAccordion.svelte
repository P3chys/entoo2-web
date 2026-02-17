<script lang="ts">
	import { slide } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import type { DocumentCategory, Document } from '$lib/types';
	import { formatFileSize, formatDate, getFileIcon } from '$lib/utils/format';
	import { expandedCategories } from '$lib/stores/ui';

	interface Props {
		category: DocumentCategory;
		documents: Document[];
		currentUserId?: string;
		isAdmin?: boolean;
		onEdit?: (categoryId: string) => void;
		onDelete?: (categoryId: string) => void;
		onDocumentDelete?: (documentId: string) => void;
		onDocumentFavorite?: (documentId: string) => void;
		onDocumentPreview?: (documentId: string) => void;
		onDocumentDownload?: (documentId: string) => void;
	}

	let {
		category,
		documents,
		currentUserId,
		isAdmin = false,
		onEdit,
		onDelete,
		onDocumentDelete,
		onDocumentFavorite,
		onDocumentPreview,
		onDocumentDownload
	}: Props = $props();

	// Use store for expansion state - persists across re-renders
	const isExpanded = $derived($expandedCategories.has(category.id));

	function toggleExpanded() {
		expandedCategories.toggle(category.id);
	}

	const isUnassigned = $derived(category.name_cs === 'Nepřiřazeno');
</script>

<div class="border border-base-200 rounded-lg mb-3 overflow-hidden">
	<!-- Header: clickable to expand/collapse -->
	<div class="flex items-center justify-between p-4 hover:bg-base-100 transition-colors">
		<button class="flex items-center gap-3 flex-1" onclick={toggleExpanded} type="button">
			<Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} />
			<h3 class="font-semibold text-lg">{category.name_cs}</h3>
			<span class="text-sm text-base-content/60">({documents.length})</span>
		</button>

		{#if isAdmin && !isUnassigned}
			<div class="flex gap-2">
				<button
					class="btn btn-ghost btn-sm"
					onclick={() => onEdit?.(category.id)}
					type="button"
					title={$_('documents.editCategory')}
				>
					<Icon name="edit" size={16} />
				</button>
				<button
					class="btn btn-ghost btn-sm text-error"
					onclick={() => onDelete?.(category.id)}
					type="button"
					title={$_('documents.deleteCategory')}
				>
					<Icon name="trash" size={16} />
				</button>
			</div>
		{/if}
	</div>

	{#if isExpanded}
		<div class="px-4 pb-4 bg-base-50" transition:slide>
			{#if documents.length === 0}
				<p class="text-center text-base-content/60 py-8">{$_('documents.noDocuments')}</p>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each documents as doc}
						<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow p-4">
							<div class="flex items-start justify-between mb-2">
								<div class="flex items-center gap-2">
									<button
										class="btn btn-ghost btn-xs"
										onclick={() => onDocumentFavorite?.(doc.id)}
										type="button"
										title="Toggle favorite"
									>
										{#if doc.is_favorite}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												class="w-4 h-4 text-yellow-400"
											>
												<path
													fill-rule="evenodd"
													d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
													clip-rule="evenodd"
												/>
											</svg>
										{:else}
											<Icon
												name="star"
												size={16}
												className="text-base-content/40 hover:text-yellow-400"
											/>
										{/if}
									</button>
									<span class="text-2xl">{getFileIcon(doc.mime_type)}</span>
								</div>
								<div class="flex gap-1">
									<button
										class="btn btn-ghost btn-xs"
										onclick={() => onDocumentPreview?.(doc.id)}
										type="button"
										title="Preview"
									>
										<Icon name="eye" size={14} />
									</button>
									<button
										class="btn btn-ghost btn-xs"
										onclick={() => onDocumentDownload?.(doc.id)}
										type="button"
										title="Download"
									>
										<Icon name="download" size={14} />
									</button>
									{#if isAdmin || doc.uploaded_by === currentUserId}
										<button
											class="btn btn-ghost btn-xs text-error"
											onclick={() => onDocumentDelete?.(doc.id)}
											type="button"
											title="Delete"
										>
											<Icon name="trash" size={14} />
										</button>
									{/if}
								</div>
							</div>

							<h4 class="font-medium text-sm line-clamp-2 mb-1" title={doc.original_name}>
								{doc.original_name}
							</h4>

							<div class="flex flex-col gap-1 text-xs text-base-content/60">
								<div class="flex items-center justify-between">
									<span>{formatFileSize(doc.file_size)}</span>
									<span>{formatDate(doc.created_at)}</span>
								</div>
								{#if doc.uploader}
									<span class="truncate">
										{$_('documents.uploadedBy')}: {doc.uploader.email}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
