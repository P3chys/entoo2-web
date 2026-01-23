<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Document, DocumentCategory, DocumentType } from '$lib/types';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		subjectId: string;
		onSuccess?: (document: Document) => void;
		onError?: (error: string) => void;
	}

	let { subjectId, onSuccess = () => {}, onError = () => {} }: Props = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state<{ current: number; total: number } | null>(null);
	let documentTypes = $state<DocumentType[]>([]);
	let selectedTypeId = $state<string | null>(null);
	let categories = $state<DocumentCategory[]>([]);
	let selectedCategoryId = $state<string | undefined>(undefined);
	let fileInput: HTMLInputElement;

	// Fetch document types for current subject
	async function fetchDocumentTypes() {
		const { data, error } = await api.get<{ success: boolean; data: DocumentType[] }>(`/api/v1/subjects/${subjectId}/types`);
		if (!error && data?.data) {
			documentTypes = data.data.sort((a, b) => a.order_index - b.order_index);
			// Auto-select first type
			if (documentTypes.length > 0 && !selectedTypeId) {
				selectedTypeId = documentTypes[0].id;
			}
		}
	}

	// Fetch categories for current subject
	async function fetchCategories() {
		const { data, error } = await api.get<{ success: boolean; data: DocumentCategory[] }>(`/api/v1/subjects/${subjectId}/categories`);
		if (!error && data?.data) {
			categories = data.data;
			// Auto-select first category for current type
			updateSelectedCategory();
		}
	}

	function updateSelectedCategory() {
		if (!selectedTypeId) return;
		const typeCategories = categories.filter(cat => cat.type_id === selectedTypeId);
		if (typeCategories.length > 0) {
			selectedCategoryId = typeCategories[0].id;
		} else {
			selectedCategoryId = undefined;
		}
	}

	// Watch for type changes to update selected category
	$effect(() => {
		if (selectedTypeId) {
			updateSelectedCategory();
		}
	});

	onMount(() => {
		fetchDocumentTypes();
		fetchCategories();
	});

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		dragging = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		dragging = false;
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		dragging = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			await uploadFiles(Array.from(e.dataTransfer.files));
		}
	};

	const handleFileSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			await uploadFiles(Array.from(target.files));
		}
	};

	const uploadFiles = async (files: File[]) => {
		uploading = true;
		uploadProgress = { current: 0, total: files.length };

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			uploadProgress = { current: i + 1, total: files.length };

			if (file.size > 50 * 1024 * 1024) {
				onError(`${file.name}: ${$t('documents.maxSize')}`);
				continue;
			}

			const { data, error } = await api.upload<{ success: boolean; data: Document }>(
				`/api/v1/subjects/${subjectId}/documents`,
				file,
				{ type_id: selectedTypeId, category_id: selectedCategoryId }
			);

			if (error) {
				onError(`${file.name}: ${error}`);
			} else if (data?.success && data.data) {
				onSuccess(data.data);
			}
		}

		uploading = false;
		uploadProgress = null;
		// Reset input
		if (fileInput) fileInput.value = '';
	};

	// Filter categories by current type
	const filteredCategories = $derived(
		categories.filter(cat => cat.type_id === selectedTypeId).sort((a, b) => a.order_index - b.order_index)
	);
</script>

<div
	class="border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 {dragging
		? 'border-primary bg-primary/5'
		: 'border-base-300 hover:border-primary/50'}"
	ondragenter={handleDragEnter}
	ondragover={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label={$t('documents.upload')}
>
	<input
		type="file"
		class="hidden"
		bind:this={fileInput}
		onchange={handleFileSelect}
		accept=".pdf,.docx,.pptx,.ppt,.jpg,.jpeg,.png,.txt,.xlsx,.xls,.csv"
		multiple
	/>

	<div class="flex flex-col items-center gap-3">
		<div class="p-3 bg-base-200 rounded-full text-primary">
            <Icon name="upload" size={24} />
		</div>

		<div>
			<h3 class="text-base font-semibold">
				{#if uploading && uploadProgress}
					{$t('common.loading')} ({uploadProgress.current}/{uploadProgress.total})
				{:else if uploading}
					{$t('common.loading')}
				{:else}
					{$t('documents.upload')}
				{/if}
			</h3>
			<p class="text-base-content/60 text-xs mt-1">
				{$t('documents.supportedFormats')}
			</p>
		</div>

		<!-- Type selector -->
		<div class="w-full max-w-xs">
			<label for="doc-type-selector" class="block text-sm font-medium mb-2 text-adaptive-primary">
				{$t('documents.categoryType')}
			</label>
			<select
				id="doc-type-selector"
				bind:value={selectedTypeId}
				class="w-full px-4 py-2 rounded-lg border border-adaptive bg-adaptive-primary text-adaptive-primary text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-all duration-200"
				disabled={uploading || documentTypes.length === 0}
			>
				{#each documentTypes as docType (docType.id)}
					<option value={docType.id}>
						{docType.name_cs}
					</option>
				{/each}
			</select>
		</div>

		<!-- Category selector -->
		{#if filteredCategories.length > 0}
			<div class="w-full max-w-xs">
				<label for="category-selector" class="block text-sm font-medium mb-2 text-adaptive-primary">
					{$t('documents.selectCategory')}
				</label>
				<select
					id="category-selector"
					bind:value={selectedCategoryId}
					class="w-full px-4 py-2 rounded-lg border border-adaptive bg-adaptive-primary text-adaptive-primary text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-all duration-200"
					disabled={uploading}
				>
					{#each filteredCategories as cat}
						<option value={cat.id}>
							{cat.name_cs}
						</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- Pass onclick as a prop to Button, as Button.svelte uses $props() and expects onclick prop -->
		<Button
			variant="primary"
			size="sm"
			disabled={uploading}
			onclick={() => fileInput.click()}
		>
			{$t('common.upload')}
		</Button>
	</div>
</div>
