<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import Button from '$components/Button.svelte';
	import { isAdmin } from '$stores/auth';
	import { api } from '$lib/utils/api';
	import { fade } from 'svelte/transition';
    import { staggerFadeIn } from '$lib/utils/animation';
    import Icon from '$lib/components/Icon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import type { Semester } from '$types';

	let semesters: Semester[] = $state([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingSemester: Semester | null = $state(null);
	let deleteConfirm: string | null = $state(null);
	
	// Form state
	let formNameCS = $state('');
	let formNameEN = $state('');
	let formOrderIndex = $state(0);
	let submitting = $state(false);
	let error = $state('');

	async function loadSemesters() {
		loading = true;
		const response = await api.get<{ success: boolean; data: Semester[] }>('/api/v1/semesters');
		if (response.data?.success) {
			semesters = response.data.data || [];
		}
		loading = false;
	}

	function openCreateModal() {
		editingSemester = null;
		formNameCS = '';
		formNameEN = '';
		formOrderIndex = semesters.length;
		error = '';
		showModal = true;
	}

	function openEditModal(semester: Semester) {
		editingSemester = semester;
		formNameCS = semester.name_cs;
		formNameEN = semester.name_en;
		formOrderIndex = semester.order_index;
		error = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingSemester = null;
	}

	async function handleSubmit() {
		if (!formNameCS.trim() || !formNameEN.trim()) {
			error = $_('semesters.errorNameRequired');
			return;
		}

		submitting = true;
		error = '';

		const payload = {
			name_cs: formNameCS.trim(),
			name_en: formNameEN.trim(),
			order_index: formOrderIndex
		};

		if (editingSemester) {
			const response = await api.put(`/api/v1/admin/semesters/${editingSemester.id}`, payload);
			if (response.error) {
				error = response.error.message || $_('semesters.errorUpdateFailed');
				submitting = false;
				return;
			}
		} else {
			const response = await api.post('/api/v1/admin/semesters', payload);
			if (response.error) {
				error = response.error.message || $_('semesters.errorCreateFailed');
				submitting = false;
				return;
			}
		}

		submitting = false;
		closeModal();
		await loadSemesters();
	}

	async function handleDelete(id: string) {
		const response = await api.delete(`/api/v1/admin/semesters/${id}`);
		if (response.error) {
			alert(response.error.message || $_('common.failed_to_delete_semester'));
		} else {
			deleteConfirm = null;
			await loadSemesters();
		}
	}

	onMount(() => {
		loadSemesters();
	});
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-3xl font-bold">{$_('semesters.title')}</h1>
		{#if $isAdmin}
			<Button variant="primary" onclick={openCreateModal}>
				<div class="flex items-center gap-2">
                    <Icon name="add" size={20} />
				    {$_('semesters.create')}
                </div>
			</Button>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner />
		</div>
	{:else if semesters.length === 0}
		<!-- Empty State -->
		<div class="empty-state">
            <Icon name="semesters" size={64} className="mb-4 opacity-50 grayscale" />

			<h3 class="empty-title">{$_('semesters.noSemesters')}</h3>
			{#if $isAdmin}
				<p class="empty-description">
					{$_('dashboard.noSemestersAdmin')}
				</p>
				<div class="flex gap-3 justify-center">
					<Button variant="primary" size="lg" onclick={openCreateModal}>
						<div class="flex items-center gap-2">
                            <Icon name="add" size={24} />
						    {$_('semesters.createFirst')}
                        </div>
					</Button>
				</div>
			{:else}
				<p class="empty-description">
					{$_('dashboard.noSemestersStudent')}
				</p>
			{/if}
		</div>
	{:else}
		<!-- Semesters List -->
		<div class="grid gap-4" use:staggerFadeIn>
			{#each semesters as semester (semester.id)}
				<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 border border-surface-200 dark:border-surface-700">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-semibold">{semester.name_cs}</h3>
							<p class="text-sm text-surface-500">{semester.name_en}</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mr-4">{$_('common.order')}: {semester.order_index}</span>
							{#if $isAdmin}
								<Button variant="ghost" size="sm" onclick={() => openEditModal(semester)} aria-label={$_('common.edit')}>
									<Icon name="edit" size={20} />
								</Button>
								{#if deleteConfirm === semester.id}
									<Button variant="danger" size="sm" onclick={() => handleDelete(semester.id)}>
										{$_('semesters.confirmDelete')}
									</Button>
									<Button variant="ghost" size="sm" onclick={() => deleteConfirm = null}>
										{$_('common.cancel')}
									</Button>
								{:else}
									<Button variant="ghost" size="sm" onclick={() => deleteConfirm = semester.id} aria-label={$_('common.delete')}>
										<Icon name="delete" size={20} />
									</Button>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="dialog-backdrop fixed inset-0 flex items-center justify-center z-50" onclick={closeModal}>
		<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-6 w-full max-w-md m-4" onclick={(e) => e.stopPropagation()}>
			<h2 class="text-xl font-bold mb-4">
				{editingSemester ? $_('semesters.edit') : $_('semesters.create')}
			</h2>
			
			{#if error}
				<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">
					{error}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="space-y-4">
					<div>
						<label for="name_cs" class="block text-sm font-medium mb-1">{$_('common.name_czech')}</label>
						<input
							id="name_cs"
							type="text"
							bind:value={formNameCS}
							class="w-full px-3 py-2 border rounded-lg bg-surface-100 dark:bg-surface-700 border-surface-300 dark:border-surface-600"
							placeholder="1. semestr"
						/>
					</div>
					<div>
						<label for="name_en" class="block text-sm font-medium mb-1">{$_('common.name_english')}</label>
						<input
							id="name_en"
							type="text"
							bind:value={formNameEN}
							class="w-full px-3 py-2 border rounded-lg bg-surface-100 dark:bg-surface-700 border-surface-300 dark:border-surface-600"
							placeholder="1st Semester"
						/>
					</div>
					<div>
						<label for="order_index" class="block text-sm font-medium mb-1">{$_('common.order_index')}</label>
						<input
							id="order_index"
							type="number"
							bind:value={formOrderIndex}
							class="w-full px-3 py-2 border rounded-lg bg-surface-100 dark:bg-surface-700 border-surface-300 dark:border-surface-600"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-3 mt-6">
					<Button variant="secondary" onclick={closeModal}>{$_('common.cancel')}</Button>
					<Button variant="primary" type="submit" loading={submitting}>
						{editingSemester ? $_('common.update') : $_('common.create')}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
