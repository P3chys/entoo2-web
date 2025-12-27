<script lang="ts">
	import { slide } from 'svelte/transition';
	import { _, locale } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import type { DocumentCategory, Document } from '$lib/types';
	import { formatFileSize, formatDate, getFileIcon } from '$lib/utils/format';

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

	let isExpanded = $state(false);

	const categoryName = $derived($locale === 'cs' ? category.name_cs : category.name_en);
	const isUnassigned = $derived(
		category.name_cs === 'Nepřiřazeno' || category.name_en === 'Unassigned'
	);
</script>

<div class="border border-base-200 rounded-lg mb-3 overflow-hidden">
	<!-- Header: clickable to expand/collapse -->
	<div class="flex items-center justify-between p-4 hover:bg-base-100 transition-colors">
		<button
			class="flex items-center gap-3 flex-1"
			onclick={() => (isExpanded = !isExpanded)}
			type="button"
		>
			<Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} />
			<h3 class="font-semibold text-lg">{categoryName}</h3>
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
										<Icon name={doc.is_favorite ? 'star' : 'star'} size={16} class={doc.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''} />
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
