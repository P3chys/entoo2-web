<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Document, DocumentCategory, DocumentType } from '$lib/types';
	import CategoryAccordion from './CategoryAccordion.svelte';
	import DocumentPreview from './DocumentPreview.svelte';
	import Icon from './Icon.svelte';
	import { activeTypes } from '$lib/stores/ui';

	interface Props {
		subjectId: string;
		documents?: Document[];
		currentUserId?: string;
		isAdmin?: boolean;
		onDelete?: (docId: string) => void;
		onRefresh?: () => void;
	}

	let {
		subjectId,
		documents = [],
		currentUserId = undefined,
		isAdmin = false,
		onDelete = () => {},
		onRefresh = () => {}
	}: Props = $props();

	let previewDocument = $state<Document | null>(null);
	let documentTypes = $state<DocumentType[]>([]);
	let categories = $state<DocumentCategory[]>([]);
	let loadingTypes = $state(false);
	let loadingCategories = $state(false);

	// Use store for active tab - persists across re-renders
	const activeTypeId = $derived(
		$activeTypes.get(subjectId) || (documentTypes.length > 0 ? documentTypes[0].id : null)
	);

	function setActiveType(typeId: string) {
		activeTypes.setActiveType(subjectId, typeId);
	}

	// Fetch document types for current subject
	async function fetchDocumentTypes() {
		loadingTypes = true;
		const { data, error } = await api.get<{ success: boolean; data: DocumentType[] }>(
			`/api/v1/subjects/${subjectId}/types`
		);
		if (!error && data?.data) {
			documentTypes = data.data.sort((a, b) => a.order_index - b.order_index);
			// Set first type as active if we have types and no active type is set
			if (documentTypes.length > 0 && !$activeTypes.get(subjectId)) {
				activeTypes.setActiveType(subjectId, documentTypes[0].id);
			}
		}
		loadingTypes = false;
	}

	// Fetch categories for current subject
	async function fetchCategories() {
		loadingCategories = true;
		const { data, error } = await api.get<{ success: boolean; data: DocumentCategory[] }>(
			`/api/v1/subjects/${subjectId}/categories`
		);
		if (!error && data?.data) {
			categories = data.data;
		}
		loadingCategories = false;
	}

	// Filter categories by active type
	const filteredCategories = $derived(
		categories
			.filter((cat) => cat.type_id === activeTypeId)
			.sort((a, b) => a.order_index - b.order_index)
	);

	// Group documents by category for active type
	const categorizedDocuments = $derived(() => {
		return filteredCategories.map((category) => ({
			category,
			documents: documents.filter(
				(doc) => doc.type_id === activeTypeId && doc.category_id === category.id
			)
		}));
	});

	onMount(() => {
		fetchDocumentTypes();
		fetchCategories();
	});

	const downloadDocument = async (docId: string) => {
		const doc = documents.find((d) => d.id === docId);
		if (!doc) return;

		try {
			const response = await fetch(`${api['baseUrl']}/api/v1/documents/${doc.id}/download`, {
				headers: {
					Authorization: `Bearer ${api.getToken()}`
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
		const { error, data } = await api.post<{ success: boolean; is_favorite: boolean }>(
			`/api/v1/documents/${docId}/favorite`,
			{}
		);
		if (!error && data) {
			// Update local state instead of full refresh to preserve UI state
			const docIndex = documents.findIndex((d) => d.id === docId);
			if (docIndex !== -1) {
				documents[docIndex] = { ...documents[docIndex], is_favorite: data.is_favorite };
				documents = [...documents]; // Trigger reactivity
			}
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
		const doc = documents.find((d) => d.id === docId);
		if (doc) {
			previewDocument = doc;
		}
	};
</script>

<div class="space-y-4">
	<!-- Dynamic Type Tabs -->
	<div class="flex gap-2 border-b border-base-300 overflow-x-auto">
		{#if loadingTypes}
			<div class="px-4 py-2 text-base-content/60">Loading...</div>
		{:else if documentTypes.length === 0}
			<div class="px-4 py-2 text-base-content/60">{$t('documents.noTypes')}</div>
		{:else}
			{#each documentTypes as docType (docType.id)}
				<button
					class="px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 {activeTypeId ===
					docType.id
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/60 hover:text-base-content'}"
					onclick={() => setActiveType(docType.id)}
					type="button"
				>
					<Icon name={docType.icon || 'folder'} size={16} />
					{docType.name_cs}
				</button>
			{/each}
		{/if}
	</div>

	{#if loadingCategories || loadingTypes}
		<div class="text-center py-8 text-base-content/60">Loading...</div>
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
<DocumentPreview document={previewDocument} onClose={() => (previewDocument = null)} />
