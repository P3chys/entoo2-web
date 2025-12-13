<script lang="ts">
	import { t } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { Document } from '$lib/types';
	import Button from './Button.svelte';

	export let subjectId: string;
	export let documents: Document[] = [];
	export let currentUserId: string | undefined = undefined;
	export let onDelete: (docId: string) => void = () => {};

	const getFileIcon = (mimeType: string) => {
		if (mimeType.includes('pdf')) return '📄';
		if (mimeType.includes('word')) return '📝';
		if (mimeType.includes('sheet') || mimeType.includes('csv')) return '📊';
		if (mimeType.includes('presentation')) return '📽️';
		if (mimeType.includes('image')) return '🖼️';
		return '📎';
	};

	const formatSize = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	const downloadDocument = async (doc: Document) => {
		// Use window.open or fetch blob for download
		// Direct link is easiest if token handling is transparent, but here we likely need auth header.
		// However, browser download via link needs cookies or query param token.
		// Since we use parsing of token in API, "DownloadDocument" handler checks header.
		// A common way is to make a fetch request, get blob, and create object URL.
		try {
			const response = await fetch(`${api['baseUrl']}/api/v1/documents/${doc.id}/download`, {
				headers: {
					'Authorization': `Bearer ${api.getToken()}`
				}
			});
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = doc.original_name;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			} else {
				console.error('Download failed');
			}
		} catch (e) {
			console.error('Download error', e);
		}
	};

	const deleteDocument = async (doc: Document) => {
		if (!confirm($t('common.delete') + '?')) return;
		
		const { error } = await api.delete(`/api/v1/documents/${doc.id}`);
		if (!error) {
			onDelete(doc.id);
		} else {
			alert(error.message);
		}
	};
</script>

<div class="space-y-4">
	{#if documents.length === 0}
		<div class="text-center py-8 text-base-content/60">
			{$t('documents.noDocuments')}
		</div>
	{:else}
		<div class="grid gap-3">
			{#each documents as doc (doc.id)}
				<div class="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-200 hover:border-primary/30 transition-colors">
					<div class="flex items-center gap-4">
						<div class="text-2xl select-none" role="img" aria-label="File icon">
							{getFileIcon(doc.mime_type)}
						</div>
						<div>
							<h4 class="font-medium text-base-content" title={doc.original_name}>
								{doc.original_name}
							</h4>
							<div class="text-xs text-base-content/60 flex items-center gap-2">
								<span>{formatSize(doc.file_size)}</span>
								<span>•</span>
								<span>{new Date(doc.created_at).toLocaleDateString()}</span>
								{#if doc.uploader}
									<span>•</span>
									<span>{doc.uploader.role === 'admin' ? 'Admin' : doc.uploader.displayName || doc.uploader.email}</span>
								{/if}
							</div>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<button 
							class="btn btn-ghost btn-sm btn-square"
							title={$t('common.download')}
							on:click={() => downloadDocument(doc)}
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-3 3m0 0l3 3m-3-3l-3 3M9 12.75V1.5" />
							</svg>
						</button>

						{#if currentUserId && (doc.uploaded_by === currentUserId || /* Admin check handled by backend, UI assumes admin if can delete, or we pass isAdmin prop */ false)}
							<!-- Note: simple check on ID. isAdmin logic could be passed via props -->
							<button 
								class="btn btn-ghost btn-sm btn-square text-error"
								title={$t('common.delete')}
								on:click={() => deleteDocument(doc)}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
								</svg>
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
