<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Document, DocumentCategory } from '$lib/types';
	import CategoryAccordion from './CategoryAccordion.svelte';
	import DocumentPreview from './DocumentPreview.svelte';
    import Icon from './Icon.svelte';

	interface Props {
		subjectId: string;
		documents?: Document[];
		currentUserId?: string;
		isAdmin?: boolean;
		onDelete?: (docId: string) => void;
		onRefresh?: () => void;
	}

	let { subjectId, documents = [], currentUserId = undefined, isAdmin = false, onDelete = () => {}, onRefresh = () => {} }: Props = $props();

	let previewDocument = $state<Document | null>(null);
	let activeTab = $state<'lecture' | 'seminar' | 'other' | 'exam'>('lecture');
	let categories = $state<DocumentCategory[]>([]);
	let loadingCategories = $state(false);

	// Fetch categories for current subject
	async function fetchCategories() {
		loadingCategories = true;
		const { data, error } = await api.get<{ success: boolean; data: DocumentCategory[] }>(`/api/v1/subjects/${subjectId}/categories`);
		if (!error && data?.data) {
			categories = data.data;
		}
		loadingCategories = false;
	}

	// Filter categories by active type
	const filteredCategories = $derived(
		categories.filter(cat => cat.type === activeTab).sort((a, b) => a.order_index - b.order_index)
	);

	// Group documents by category for active type
	const categorizedDocuments = $derived(() => {
		return filteredCategories.map(category => ({
			category,
			documents: documents.filter(doc => doc.type === activeTab && doc.category_id === category.id)
		}));
	});

	onMount(() => {
		fetchCategories();
	});

	const downloadDocument = async (docId: string) => {
		const doc = documents.find(d => d.id === docId);
		if (!doc) return;

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

	const toggleFavorite = async (docId: string) => {
		const { error, data } = await api.post<{ success: boolean; is_favorite: boolean }>(`/api/v1/documents/${docId}/favorite`, {});
		if (!error && data) {
			// Trigger reactivity by calling onRefresh to reload data
			onRefresh();
		}
	};

	const deleteDocument = async (docId: string) => {
		if (!confirm($t('common.delete') + '?')) return;

		const { error } = await api.delete(`/api/v1/documents/${docId}`);
		if (!error) {
			onDelete(docId);
			onRefresh();
		} else {
			alert(error);
		}
	};

	const handlePreview = (docId: string) => {
		const doc = documents.find(d => d.id === docId);
		if (doc) {
			previewDocument = doc;
		}
	};
</script>

<div class="space-y-4">
	<!-- Type Tabs -->
	<div class="flex gap-2 border-b border-base-300 overflow-x-auto">
		<button
			class="px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap {activeTab === 'lecture' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'}"
			onclick={() => activeTab = 'lecture'}
			type="button"
		>
			{$t('documents.tabLectures')}
		</button>
		<button
			class="px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap {activeTab === 'seminar' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'}"
			onclick={() => activeTab = 'seminar'}
			type="button"
		>
			{$t('documents.tabSeminars')}
		</button>
		<button
			class="px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap {activeTab === 'exam' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'}"
			onclick={() => activeTab = 'exam'}
			type="button"
		>
			{$t('documents.tabExams')}
		</button>
		<button
			class="px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap {activeTab === 'other' ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'}"
			onclick={() => activeTab = 'other'}
			type="button"
		>
			{$t('documents.tabOthers')}
		</button>
	</div>

	{#if loadingCategories}
		<div class="text-center py-8 text-base-content/60">
			Loading categories...
		</div>
	{:else if categorizedDocuments().length === 0}
		<div class="text-center py-8 text-base-content/60">
			{$t('documents.noDocuments')}
		</div>
	{:else}
		<div class="space-y-3">
			{#each categorizedDocuments() as { category, documents: categoryDocs } (category.id)}
				<CategoryAccordion
					{category}
					documents={categoryDocs}
					{currentUserId}
					{isAdmin}
					onDocumentDelete={deleteDocument}
					onDocumentFavorite={toggleFavorite}
					onDocumentPreview={handlePreview}
					onDocumentDownload={downloadDocument}
				/>
			{/each}
		</div>
	{/if}
</div>

<!-- Preview Modal -->
<DocumentPreview
	document={previewDocument}
	onClose={() => previewDocument = null}
/>
