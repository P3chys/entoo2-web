<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Document } from '$lib/types';
	import { api } from '$lib/utils/api';
	import Button from './Button.svelte';

	interface Props {
		document: Document | null;
		onClose?: () => void;
	}

	let { document, onClose = () => {} }: Props = $props();

	let previewUrl = $state<string>('');
	let textContent = $state<string>('');
	let loading = $state(true);
	let error = $state('');

	const canPreview = (mimeType: string) => {
		return mimeType.includes('image') ||
		       mimeType.includes('pdf') ||
		       mimeType.includes('text');
	};

	const loadPreview = async () => {
		if (!document) return;

		loading = true;
		error = '';

		try {
			const response = await fetch(`${api['baseUrl']}/api/v1/documents/${document.id}/download`, {
				headers: {
					'Authorization': `Bearer ${api.getToken()}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to load preview');
			}

			const blob = await response.blob();

			if (document.mime_type.includes('text')) {
				// For text files, read as text
				const text = await blob.text();
				textContent = text;
			} else {
				// For images and PDFs, create object URL
				previewUrl = window.URL.createObjectURL(blob);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load preview';
		} finally {
			loading = false;
		}
	};

	$effect(() => {
		if (document) {
			loadPreview();
		}
		return () => {
			if (previewUrl) {
				window.URL.revokeObjectURL(previewUrl);
			}
		};
	});

	const handleClose = () => {
		if (previewUrl) {
			window.URL.revokeObjectURL(previewUrl);
		}
		previewUrl = '';
		textContent = '';
		onClose();
	};
</script>

{#if document}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onclick={handleClose}>
		<div
			class="bg-surface-50 dark:bg-surface-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="preview-title"
			aria-modal="true"
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
				<div>
					<h2 id="preview-title" class="text-xl font-bold text-base-content">
						{document.original_name}
					</h2>
					<p class="text-sm text-base-content/60">
						{document.mime_type} • {(document.file_size / 1024).toFixed(1)} KB
					</p>
				</div>
				<button
					onclick={handleClose}
					class="btn btn-ghost btn-sm btn-square"
					aria-label="Close preview"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Preview Content -->
			<div class="flex-1 overflow-auto p-4">
				{#if loading}
					<div class="flex items-center justify-center h-full">
						<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					</div>
				{:else if error}
					<div class="flex flex-col items-center justify-center h-full gap-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-error">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
						</svg>
						<p class="text-error">{error}</p>
					</div>
				{:else if !canPreview(document.mime_type)}
					<div class="flex flex-col items-center justify-center h-full gap-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 text-base-content/40">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
						</svg>
						<p class="text-base-content/60">Preview not available for this file type</p>
						<p class="text-sm text-base-content/40">Use the download button to view this file</p>
					</div>
				{:else if document.mime_type.includes('image')}
					<div class="flex items-center justify-center">
						<img
							src={previewUrl}
							alt={document.original_name}
							class="max-w-full max-h-[calc(90vh-200px)] object-contain rounded"
						/>
					</div>
				{:else if document.mime_type.includes('pdf')}
					<iframe
						src={previewUrl}
						class="w-full h-[calc(90vh-200px)] rounded border border-surface-200 dark:border-surface-700"
						title="PDF Preview"
					></iframe>
				{:else if document.mime_type.includes('text')}
					<pre class="bg-surface-100 dark:bg-surface-800 p-4 rounded border border-surface-200 dark:border-surface-700 overflow-auto max-h-[calc(90vh-200px)] text-sm font-mono whitespace-pre-wrap">{textContent}</pre>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 p-4 border-t border-surface-200 dark:border-surface-700">
				<Button variant="ghost" onclick={handleClose}>
					{$t('common.close')}
				</Button>
			</div>
		</div>
	</div>
{/if}
