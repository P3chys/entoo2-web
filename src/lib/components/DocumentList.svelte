<script lang="ts">
	import { t } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { Document } from '$lib/types';
	import Button from './Button.svelte';
	import DocumentPreview from './DocumentPreview.svelte';
    import Icon from './Icon.svelte';

	interface Props {
		subjectId: string;
		documents?: Document[];
		currentUserId?: string;
		onDelete?: (docId: string) => void;
	}

	let { subjectId, documents = [], currentUserId = undefined, onDelete = () => {} }: Props = $props();

	let previewDocument = $state<Document | null>(null);

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
						<!-- Preview button -->
						<button
							class="btn btn-ghost btn-sm btn-square"
							title="Preview"
							onclick={() => previewDocument = doc}
						>
                            <Icon name="search" size={20} />
						</button>

						<!-- Download button -->
						<button
							class="btn btn-ghost btn-sm btn-square"
							title={$t('common.download')}
							onclick={() => downloadDocument(doc)}
						>
                            <Icon name="download" size={20} />
						</button>

						<!-- Delete button -->
						{#if currentUserId && (doc.uploaded_by === currentUserId || /* Admin check handled by backend, UI assumes admin if can delete, or we pass isAdmin prop */ false)}
							<button
								class="btn btn-ghost btn-sm btn-square text-error"
								title={$t('common.delete')}
								onclick={() => deleteDocument(doc)}
							>
                                <Icon name="delete" size={20} />
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Preview Modal -->
<DocumentPreview
	document={previewDocument}
	onClose={() => previewDocument = null}
/>
