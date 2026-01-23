<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { DocumentCategory, DocumentType } from '$lib/types';
	import { Modal } from '$lib/components/ui';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		subjectId: string;
		isOpen?: boolean;
		onClose?: () => void;
		onUpdate?: () => void;
	}

	let { subjectId, isOpen = false, onClose = () => {}, onUpdate = () => {} }: Props = $props();

	let documentTypes = $state<DocumentType[]>([]);
	let categories = $state<DocumentCategory[]>([]);
	let loading = $state(false);

	// Type management
	let showCreateTypeForm = $state(false);
	let editingType = $state<DocumentType | null>(null);
	let typeFormNameCS = $state('');
	let typeFormIcon = $state('folder');

	// Category management
	let showCreateCategoryForm = $state(false);
	let editingCategory = $state<DocumentCategory | null>(null);
	let selectedTypeId = $state<string | null>(null);
	let categoryFormNameCS = $state('');

	const iconOptions = ['folder', 'book-open', 'users', 'file-text', 'clipboard', 'archive', 'layers', 'bookmark'];

	async function fetchData() {
		loading = true;
		const [typesRes, categoriesRes] = await Promise.all([
			api.get<{ success: boolean; data: DocumentType[] }>(`/api/v1/subjects/${subjectId}/types`),
			api.get<{ success: boolean; data: DocumentCategory[] }>(`/api/v1/subjects/${subjectId}/categories`)
		]);

		if (!typesRes.error && typesRes.data?.data) {
			documentTypes = typesRes.data.data.sort((a, b) => a.order_index - b.order_index);
		}
		if (!categoriesRes.error && categoriesRes.data?.data) {
			categories = categoriesRes.data.data;
		}
		loading = false;
	}

	// Document Type CRUD
	async function createType() {
		if (!typeFormNameCS) {
			alert($_('common.nameRequired'));
			return;
		}

		const { error } = await api.post(`/api/v1/admin/subjects/${subjectId}/types`, {
			name_cs: typeFormNameCS,
			icon: typeFormIcon
		});

		if (!error) {
			resetTypeForm();
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_create'));
		}
	}

	async function updateType() {
		if (!editingType) return;

		const { error } = await api.put(`/api/v1/admin/types/${editingType.id}`, {
			name_cs: typeFormNameCS,
			icon: typeFormIcon
		});

		if (!error) {
			resetTypeForm();
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_update'));
		}
	}

	async function deleteType(typeId: string) {
		if (!confirm($_('documents.confirmDeleteType'))) return;

		const { error } = await api.delete(`/api/v1/admin/types/${typeId}`);

		if (!error) {
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_delete'));
		}
	}

	function startEditType(type: DocumentType) {
		editingType = type;
		typeFormNameCS = type.name_cs;
		typeFormIcon = type.icon;
		showCreateTypeForm = false;
	}

	function resetTypeForm() {
		editingType = null;
		typeFormNameCS = '';
		typeFormIcon = 'folder';
		showCreateTypeForm = false;
	}

	// Category CRUD
	async function createCategory() {
		if (!categoryFormNameCS || !selectedTypeId) {
			alert($_('common.nameRequired'));
			return;
		}

		const { error } = await api.post(`/api/v1/admin/subjects/${subjectId}/categories`, {
			type_id: selectedTypeId,
			name_cs: categoryFormNameCS
		});

		if (!error) {
			resetCategoryForm();
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_create_category'));
		}
	}

	async function updateCategory() {
		if (!editingCategory) return;

		const { error } = await api.put(`/api/v1/admin/categories/${editingCategory.id}`, {
			name_cs: categoryFormNameCS
		});

		if (!error) {
			resetCategoryForm();
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_update_category'));
		}
	}

	async function deleteCategory(categoryId: string) {
		if (!confirm($_('documents.confirmDeleteCategory'))) return;

		const { error } = await api.delete(`/api/v1/admin/categories/${categoryId}`);

		if (!error) {
			await fetchData();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_delete_category'));
		}
	}

	function startEditCategory(category: DocumentCategory) {
		editingCategory = category;
		categoryFormNameCS = category.name_cs;
		showCreateCategoryForm = false;
	}

	function resetCategoryForm() {
		editingCategory = null;
		categoryFormNameCS = '';
		showCreateCategoryForm = false;
		selectedTypeId = null;
	}

	function getCategoriesForType(typeId: string) {
		return categories.filter(c => c.type_id === typeId).sort((a, b) => a.order_index - b.order_index);
	}

	const isUnassigned = (category: DocumentCategory) => category.name_cs === 'Nepřiřazeno';

	$effect(() => {
		if (isOpen) {
			fetchData();
		}
	});
</script>

<Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
	<!-- Header -->
	<div class="flex items-center justify-between pb-4 mb-4 border-b border-surface-200 dark:border-surface-700">
		<h2 class="text-2xl font-bold">{$_('documents.manageTypesAndCategories')}</h2>
		<button class="btn btn-ghost btn-sm btn-circle" onclick={onClose} type="button">
			<Icon name="x" size={20} />
		</button>
	</div>

	<!-- Content -->
	<div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
		{#if loading}
			<div class="text-center py-8">{$_('common.loading')}</div>
		{:else}
			<!-- Document Types Section -->
			<section>
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold flex items-center gap-2">
						<Icon name="layers" size={20} />
						{$_('documents.documentTypes')}
					</h3>
					{#if !showCreateTypeForm && !editingType}
						<Button variant="primary" size="sm" onclick={() => showCreateTypeForm = true}>
							<Icon name="plus" size={16} />
							{$_('documents.createType')}
						</Button>
					{/if}
				</div>

				<!-- Create/Edit Type Form -->
				{#if showCreateTypeForm || editingType}
					<div class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 mb-4 bg-surface-100 dark:bg-surface-900">
						<h4 class="font-semibold mb-3">
							{editingType ? $_('documents.editType') : $_('documents.createType')}
						</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium mb-1">{$_('common.name')}</label>
								<input
									type="text"
									bind:value={typeFormNameCS}
									class="input input-bordered w-full"
									placeholder="Např. Přednášky"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium mb-1">{$_('common.icon')}</label>
								<select bind:value={typeFormIcon} class="select select-bordered w-full">
									{#each iconOptions as icon}
										<option value={icon}>{icon}</option>
									{/each}
								</select>
							</div>
						</div>
						<div class="flex gap-2 justify-end mt-4">
							<Button variant="ghost" size="sm" onclick={resetTypeForm}>
								{$_('common.cancel')}
							</Button>
							<Button variant="primary" size="sm" onclick={editingType ? updateType : createType}>
								{editingType ? $_('common.save') : $_('common.create')}
							</Button>
						</div>
					</div>
				{/if}

				<!-- Types List with Categories -->
				<div class="space-y-4">
					{#each documentTypes as docType (docType.id)}
						<div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
							<!-- Type Header -->
							<div class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-800">
								<div class="flex items-center gap-3">
									<Icon name={docType.icon || 'folder'} size={20} className="text-primary" />
									<span class="font-medium">{docType.name_cs}</span>
								</div>
								<div class="flex gap-2">
									<button
										class="btn btn-ghost btn-xs"
										onclick={() => { selectedTypeId = docType.id; showCreateCategoryForm = true; }}
										title={$_('documents.addCategory')}
									>
										<Icon name="folder-plus" size={16} />
									</button>
									<button
										class="btn btn-ghost btn-xs"
										onclick={() => startEditType(docType)}
									>
										<Icon name="edit" size={16} />
									</button>
									<button
										class="btn btn-ghost btn-xs text-error"
										onclick={() => deleteType(docType.id)}
									>
										<Icon name="trash" size={16} />
									</button>
								</div>
							</div>

							<!-- Categories for this Type -->
							<div class="p-3 space-y-2">
								{#each getCategoriesForType(docType.id) as category (category.id)}
									<div class="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-900 rounded">
										<span class={isUnassigned(category) ? 'italic text-surface-500' : ''}>
											{category.name_cs}
										</span>
										{#if !isUnassigned(category)}
											<div class="flex gap-1">
												<button
													class="btn btn-ghost btn-xs"
													onclick={() => startEditCategory(category)}
												>
													<Icon name="edit" size={14} />
												</button>
												<button
													class="btn btn-ghost btn-xs text-error"
													onclick={() => deleteCategory(category.id)}
												>
													<Icon name="trash" size={14} />
												</button>
											</div>
										{/if}
									</div>
								{:else}
									<div class="text-sm text-surface-500 italic p-2">
										{$_('documents.noCategories')}
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="text-center py-8 text-surface-500">
							{$_('documents.noTypes')}
						</div>
					{/each}
				</div>
			</section>

			<!-- Create Category Modal Form -->
			{#if showCreateCategoryForm || editingCategory}
				<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick={resetCategoryForm}>
					<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-6 max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
						<h4 class="font-semibold mb-4">
							{editingCategory ? $_('documents.editCategory') : $_('documents.createCategory')}
						</h4>
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium mb-1">{$_('documents.categoryName')}</label>
								<input
									type="text"
									bind:value={categoryFormNameCS}
									class="input input-bordered w-full"
									placeholder="Např. Prof. Novák"
								/>
							</div>
						</div>
						<div class="flex gap-2 justify-end mt-6">
							<Button variant="ghost" size="sm" onclick={resetCategoryForm}>
								{$_('common.cancel')}
							</Button>
							<Button variant="primary" size="sm" onclick={editingCategory ? updateCategory : createCategory}>
								{editingCategory ? $_('common.save') : $_('common.create')}
							</Button>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</Modal>
