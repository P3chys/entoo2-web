<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { DocumentCategory } from '$lib/types';
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

	let categories = $state<DocumentCategory[]>([]);
	let loading = $state(false);
	let showCreateForm = $state(false);
	let editingCategory = $state<DocumentCategory | null>(null);

	// Form fields
	let formType = $state<'lecture' | 'seminar' | 'other' | 'exam'>('lecture');
	let formNameCS = $state('');

	async function fetchCategories() {
		loading = true;
		const { data, error } = await api.get<{ success: boolean; data: DocumentCategory[] }>(
			`/api/v1/subjects/${subjectId}/categories`
		);
		if (!error && data?.data) {
			categories = data.data;
		}
		loading = false;
	}

	async function createCategory() {
		if (!formNameCS) {
			alert('Jmeno musi byt vyplneno');
			return;
		}

		const { error } = await api.post(`/api/v1/admin/subjects/${subjectId}/categories`, {
			type: formType,
			name_cs: formNameCS
		});

		if (!error) {
			formNameCS = '';
			showCreateForm = false;
			await fetchCategories();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_create_category'));
		}
	}

	async function updateCategory() {
		if (!editingCategory) return;

		const { error } = await api.put(`/api/v1/admin/categories/${editingCategory.id}`, {
			name_cs: formNameCS
		});

		if (!error) {
			editingCategory = null;
			formNameCS = '';
			await fetchCategories();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_update_category'));
		}
	}

	async function deleteCategory(categoryId: string) {
		if (!confirm($_('documents.confirmDeleteCategory'))) return;

		const { error } = await api.delete(`/api/v1/admin/categories/${categoryId}`);

		if (!error) {
			await fetchCategories();
			onUpdate();
		} else {
			alert(error.message || $_('common.failed_to_delete_category'));
		}
	}

	function startEdit(category: DocumentCategory) {
		editingCategory = category;
		formNameCS = category.name_cs;
		formType = category.type;
		showCreateForm = false;
	}

	function cancelEdit() {
		editingCategory = null;
		formNameCS = '';
		showCreateForm = false;
	}

	// Filter categories by type for display
	const lectureCategories = $derived(categories.filter((c) => c.type === 'lecture'));
	const seminarCategories = $derived(categories.filter((c) => c.type === 'seminar'));
	const otherCategories = $derived(categories.filter((c) => c.type === 'other'));
	const examCategories = $derived(categories.filter((c) => c.type === 'exam'));

	$effect(() => {
		if (isOpen) {
			fetchCategories();
		}
	});

	const isUnassigned = (category: DocumentCategory) =>
		category.name_cs === 'Nepřiřazeno';
</script>

<Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
	<!-- Header -->
	<div class="flex items-center justify-between pb-4 mb-4 border-b border-surface-200 dark:border-surface-700">
		<h2 class="text-2xl font-bold">{$_('documents.manageCategories')}</h2>
		<button class="btn btn-ghost btn-sm btn-circle" onclick={onClose} type="button">
			<Icon name="x" size={20} />
		</button>
	</div>

	<!-- Content -->
	<div class="p-6 space-y-6">
				{#if loading}
					<div class="text-center py-8">{$_('common.loading')}</div>
				{:else}
					<!-- Create/Edit Form -->
					{#if showCreateForm || editingCategory}
						<div class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 space-y-4 bg-surface-100 dark:bg-surface-900">
							<h3 class="font-semibold">
								{editingCategory
									? $_('documents.editCategory')
									: $_('documents.createCategory')}
							</h3>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								{#if !editingCategory}
									<div>
										<label for="category-type" class="block text-sm font-medium mb-1">
											{$_('documents.categoryType')}
										</label>
										<select id="category-type" bind:value={formType} class="select select-bordered w-full">
											<option value="lecture">{$_('documents.categoryLecture')}</option>
											<option value="seminar">{$_('documents.categorySeminar')}</option>
											<option value="exam">{$_('documents.categoryExam')}</option>
											<option value="other">{$_('documents.categoryOther')}</option>
										</select>
									</div>
								{/if}

								<div class={editingCategory ? 'md:col-span-2' : ''}>
									<label for="category-name" class="block text-sm font-medium mb-1">
										{$_('documents.categoryName')}
									</label>
									<input
										id="category-name"
										type="text"
										bind:value={formNameCS}
										class="input input-bordered w-full"
										placeholder="Např. Přednášky 2024, Prof. Novák"
									/>
								</div>
							</div>

							<div class="flex gap-2 justify-end">
								<Button variant="ghost" size="sm" onclick={cancelEdit}>
									{$_('common.cancel')}
								</Button>
								<Button
									variant="primary"
									size="sm"
									onclick={editingCategory ? updateCategory : createCategory}
								>
									{editingCategory ? $_('common.save') : $_('common.create')}
								</Button>
							</div>
						</div>
					{:else}
						<Button
							variant="primary"
							size="sm"
							onclick={() => (showCreateForm = true)}
						>
							<Icon name="plus" size={16} />
							{$_('documents.createCategory')}
						</Button>
					{/if}

					<!-- Categories by Type -->
					<div class="space-y-6">
						<!-- Lectures -->
						<div>
							<h3 class="font-semibold mb-3">{$_('documents.tabLectures')}</h3>
							<div class="space-y-2">
								{#each lectureCategories as category}
									<div
										class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700"
									>
										<div>
											<div class="font-medium">{category.name_cs}</div>
										</div>
										{#if !isUnassigned(category)}
											<div class="flex gap-2">
												<button
													class="btn btn-ghost btn-sm"
													onclick={() => startEdit(category)}
													type="button"
												>
													<Icon name="edit" size={16} />
												</button>
												<button
													class="btn btn-ghost btn-sm text-error"
													onclick={() => deleteCategory(category.id)}
													type="button"
												>
													<Icon name="trash" size={16} />
												</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<!-- Seminars -->
						<div>
							<h3 class="font-semibold mb-3">{$_('documents.tabSeminars')}</h3>
							<div class="space-y-2">
								{#each seminarCategories as category}
									<div
										class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700"
									>
										<div>
											<div class="font-medium">{category.name_cs}</div>
										</div>
										{#if !isUnassigned(category)}
											<div class="flex gap-2">
												<button
													class="btn btn-ghost btn-sm"
													onclick={() => startEdit(category)}
													type="button"
												>
													<Icon name="edit" size={16} />
												</button>
												<button
													class="btn btn-ghost btn-sm text-error"
													onclick={() => deleteCategory(category.id)}
													type="button"
												>
													<Icon name="trash" size={16} />
												</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<!-- Other -->
						<div>
							<h3 class="font-semibold mb-3">{$_('documents.tabOthers')}</h3>
							<div class="space-y-2">
								{#each otherCategories as category}
									<div
										class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700"
									>
										<div>
											<div class="font-medium">{category.name_cs}</div>
										</div>
										{#if !isUnassigned(category)}
											<div class="flex gap-2">
												<button
													class="btn btn-ghost btn-sm"
													onclick={() => startEdit(category)}
													type="button"
												>
													<Icon name="edit" size={16} />
												</button>
												<button
													class="btn btn-ghost btn-sm text-error"
													onclick={() => deleteCategory(category.id)}
													type="button"
												>
													<Icon name="trash" size={16} />
												</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<!-- Exams -->
						<div>
							<h3 class="font-semibold mb-3">{$_('documents.tabExams')}</h3>
							<div class="space-y-2">
								{#each examCategories as category}
									<div
										class="flex items-center justify-between p-3 bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700"
									>
										<div>
											<div class="font-medium">{category.name_cs}</div>
										</div>
										{#if !isUnassigned(category)}
											<div class="flex gap-2">
												<button
													class="btn btn-ghost btn-sm"
													onclick={() => startEdit(category)}
													type="button"
												>
													<Icon name="edit" size={16} />
												</button>
												<button
													class="btn btn-ghost btn-sm text-error"
													onclick={() => deleteCategory(category.id)}
													type="button"
												>
													<Icon name="trash" size={16} />
												</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
	</div>
</Modal>
