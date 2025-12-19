<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade, slide } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import Icon from '$components/Icon.svelte';
	import { fadeSlideIn } from '$lib/utils/animation';
	import type { Subject } from '$types';

	const subjectId = $page.params.id;

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	
	let formData = $state({
		code: '',
		name_cs: '',
		name_en: '',
		description_cs: '',
		description_en: '',
		credits: 0,
		teachers: [] as { name: string; topic_cs: string; topic_en: string }[]
	});

	async function loadData() {
		loading = true;
		const res = await api.get<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}`);

		if (res.error) {
			error = res.error.message || $_('common.failed_to_load_subject');
		} else if (res.data?.success) {
			const s = res.data.data;
			formData = {
				code: s.code,
				name_cs: s.name_cs,
				name_en: s.name_en,
				description_cs: s.description_cs || '',
				description_en: s.description_en || '',
				credits: s.credits,
				teachers: s.teachers?.map(t => ({
					name: t.teacher_name,
					topic_cs: t.topic_cs || '',
					topic_en: t.topic_en || ''
				})) || []
			};
		}
		loading = false;
	}

	async function handleSubmit() {
		saving = true;
		error = '';

		// Use the ADMIN endpoint
		const res = await api.put<{ success: boolean; data: Subject }>(`/api/v1/admin/subjects/${subjectId}`, formData);

		if (res.error) {
			error = res.error.message || $_('common.failed_to_update_subject');
		} else if (res.data?.success) {
			goto(`/subjects/${subjectId}`);
		}
		saving = false;
	}

	function addTeacher() {
		formData.teachers = [...formData.teachers, { name: '', topic_cs: '', topic_en: '' }];
	}

	function removeTeacher(index: number) {
		formData.teachers = formData.teachers.filter((_, i) => i !== index);
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="max-w-4xl mx-auto h-full flex flex-col pb-10" in:fade={{ duration: 200 }}>
	<!-- Back link -->
	<div class="mb-4" use:fadeSlideIn>
		<a href="/subjects/{subjectId}" class="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors group">
			<Icon name="arrow-left" size={16} className="group-hover:-translate-x-1 transition-transform" />
			{$_('common.back')}
		</a>
	</div>

	<div class="card p-8" use:fadeSlideIn={{ delay: 100 }}>
		<h1 class="text-2xl font-bold mb-6 flex items-center gap-3">
			<Icon name="edit" size={24} className="text-accent-primary" />
			{$_('common.edit_subject')}
		</h1>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
			</div>
		{:else}
			{#if error}
				<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
					{error}
				</div>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-8">
				<!-- Basic Info Section -->
				<section class="space-y-6">
					<h3 class="text-lg font-semibold border-b border-light-border-primary dark:border-dark-border-primary pb-2">
						{$_('common.basic_info')}
					</h3>
					
					<!-- Code & Credits -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label for="code" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.code')}
							</label>
							<input
								type="text"
								id="code"
								bind:value={formData.code}
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
								required
							/>
						</div>
						<div>
							<label for="credits" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.credits')}
							</label>
							<input
								type="number"
								id="credits"
								bind:value={formData.credits}
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
								required
								min="1"
							/>
						</div>
					</div>

					<!-- Names -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label for="name_cs" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.name_cs')}
							</label>
							<input
								type="text"
								id="name_cs"
								bind:value={formData.name_cs}
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
								required
							/>
						</div>
						<div>
							<label for="name_en" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.name_en')}
							</label>
							<input
								type="text"
								id="name_en"
								bind:value={formData.name_en}
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
								required
							/>
						</div>
					</div>

					<!-- Descriptions -->
					<div class="space-y-6">
						<div>
							<label for="description_cs" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.description_cs')}
							</label>
							<textarea
								id="description_cs"
								bind:value={formData.description_cs}
								rows="3"
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
							></textarea>
						</div>
						<div>
							<label for="description_en" class="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
								{$_('common.description_en')}
							</label>
							<textarea
								id="description_en"
								bind:value={formData.description_en}
								rows="3"
								class="w-full px-4 py-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
							></textarea>
						</div>
					</div>
				</section>

				<!-- Teachers Section -->
				<section class="space-y-4">
					<div class="flex items-center justify-between border-b border-light-border-primary dark:border-dark-border-primary pb-2">
						<h3 class="text-lg font-semibold">
							{$_('common.teachers')}
						</h3>
						<button
							type="button"
							on:click={addTeacher}
							class="text-sm btn-secondary px-3 py-1 flex items-center gap-2"
						>
							<Icon name="add" size={14} />
							{$_('common.add_teacher')}
						</button>
					</div>

					{#if formData.teachers.length === 0}
						<div class="text-center py-6 text-light-text-secondary dark:text-dark-text-secondary italic bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
							{$_('subjects.noTeachers')}
						</div>
					{/if}
					
					<div class="space-y-4">
						{#each formData.teachers as teacher, i}
							<div class="p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg relative group" transition:slide>
								<button
									type="button"
									on:click={() => removeTeacher(i)}
									class="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"
									title={$_('common.remove_teacher')}
								>
									<Icon name="delete" size={16} />
								</button>

								<div class="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
									<div>
										<label class="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
											{$_('common.teacher_name')}
										</label>
										<input
											type="text"
											bind:value={teacher.name}
											class="w-full px-3 py-1.5 text-sm rounded border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
											required
										/>
									</div>
									<div>
										<label class="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
											{$_('common.teacher_topic_cs')}
										</label>
										<input
											type="text"
											bind:value={teacher.topic_cs}
											class="w-full px-3 py-1.5 text-sm rounded border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
										/>
									</div>
									<div>
										<label class="block text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
											{$_('common.teacher_topic_en')}
										</label>
										<input
											type="text"
											bind:value={teacher.topic_en}
											class="w-full px-3 py-1.5 text-sm rounded border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
										/>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>

				<!-- Actions -->
				<div class="flex items-center justify-end gap-3 pt-6 border-t border-light-border-primary dark:border-dark-border-primary">
					<a
						href="/subjects/{subjectId}"
						class="px-4 py-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
					>
						{$_('common.cancel')}
					</a>
					<button
						type="submit"
						disabled={saving}
						class="btn-primary px-6 py-2 flex items-center gap-2"
					>
						{#if saving}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						{:else}
							<Icon name="check" size={18} />
						{/if}
						{$_('common.save_changes')}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
