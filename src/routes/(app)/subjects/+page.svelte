<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import { isAdmin } from '$stores/auth';
	import { api } from '$lib/utils/api';
	import { fade } from 'svelte/transition';
    import { staggerFadeIn } from '$lib/utils/animation';
    import Icon from '$lib/components/Icon.svelte';
	import type { Subject, Semester } from '$types';

	let subjects: Subject[] = $state([]);
	let semesters: Semester[] = $state([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingSubject: Subject | null = $state(null);
	let deleteConfirm: string | null = $state(null);
	let searchQuery = $state('');

	// Form state
	let formSemesterID = $state('');
	let formNameCS = $state('');
	let formCode = $state('');
	let formDescCS = $state('');
	let formCredits = $state(0);

	interface TeacherInput {
		name: string;
		topic_cs: string;
	}
	let formTeachers: TeacherInput[] = $state([]);

	let submitting = $state(false);
	let error = $state('');

	// Group subjects by semester
	let groupedSubjects = $derived.by(() => {
		const result = semesters.map(semester => {
			const semesterSubjects = subjects.filter(s =>
				s.semester_id === semester.id &&
				(searchQuery === '' ||
				 s.name_cs.toLowerCase().includes(searchQuery.toLowerCase()) ||
				 s.code.toLowerCase().includes(searchQuery.toLowerCase()))
			);
			return { semester, subjects: semesterSubjects };
		});

		// If searching, only show semesters with matching subjects
		if (searchQuery) {
			return result.filter(g => g.subjects.length > 0);
		}
		return result;
	});

	async function loadData() {
		loading = true;
		const [subjectsRes, semestersRes] = await Promise.all([
			api.get<{ success: boolean; data: Subject[] }>('/api/v1/subjects'),
			api.get<{ success: boolean; data: Semester[] }>('/api/v1/semesters')
		]);
		
		if (subjectsRes.data?.success) {
			subjects = subjectsRes.data.data || [];
		}
		if (semestersRes.data?.success) {
			semesters = (semestersRes.data.data || []).sort((a, b) => a.order_index - b.order_index);
		}
		loading = false;
	}

	function addTeacher() {
		formTeachers = [...formTeachers, { name: '', topic_cs: '' }];
	}

	function removeTeacher(index: number) {
		formTeachers = formTeachers.filter((_, i) => i !== index);
	}

	function openCreateModal() {
		editingSubject = null;
		formSemesterID = semesters[0]?.id || '';
		formNameCS = '';
		formCode = '';
		formDescCS = '';
		formCredits = 0;
		formTeachers = [];
		error = '';
		showModal = true;
	}

	function openEditModal(subject: Subject) {
		editingSubject = subject;
		formSemesterID = subject.semester_id;
		formNameCS = subject.name_cs;
		formCode = subject.code || '';
		formDescCS = subject.description_cs || '';
		formCredits = subject.credits;
		formTeachers = subject.teachers?.map(t => ({
			name: t.teacher_name,
			topic_cs: t.topic_cs
		})) || [];
		error = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingSubject = null;
	}

	async function handleSubmit() {
		if (!formNameCS.trim()) {
			error = $_('subjects.errorNameRequired');
			return;
		}
		if (!formCode.trim()) {
			error = $_('subjects.errorCodeRequired');
			return;
		}
		if (formCode.length < 3 || formCode.length > 6) {
			error = $_('subjects.errorCodeLength');
			return;
		}
		if (!formSemesterID) {
			error = $_('subjects.errorSemesterRequired');
			return;
		}

		submitting = true;
		error = '';

		const payload = {
			semester_id: formSemesterID,
			name_cs: formNameCS.trim(),
			code: formCode.trim().toUpperCase(),
			description_cs: formDescCS.trim(),
			credits: formCredits,
			teachers: formTeachers.filter(t => t.name.trim() !== '')
		};

		if (editingSubject) {
			const response = await api.put(`/api/v1/admin/subjects/${editingSubject.id}`, payload);
			if (response.error) {
				error = response.error.message || $_('common.failed_to_update_subject');
				submitting = false;
				return;
			}
		} else {
			const response = await api.post('/api/v1/admin/subjects', payload);
			if (response.error) {
				error = response.error.message || $_('common.failed_to_create_subject');
				submitting = false;
				return;
			}
		}

		submitting = false;
		closeModal();
		await loadData();
	}

	async function handleDelete(id: string) {
		const response = await api.delete(`/api/v1/admin/subjects/${id}`);
		if (response.error) {
			alert(response.error.message || $_('common.failed_to_delete_subject'));
		} else {
			deleteConfirm = null;
			await loadData();
		}
	}

	import { goto } from '$app/navigation';

	async function toggleFavorite(subject: Subject) {
		// Optimistic update
		const oldState = subject.is_favorite;
		subject.is_favorite = !oldState;

		const { error, data } = await api.post<{ success: boolean; is_favorite: boolean }>(`/api/v1/subjects/${subject.id}/favorite`, {});
		if (error) {
			// Revert on error
			subject.is_favorite = oldState;
			alert(error.message || $_('common.failed_to_toggle_favorite'));
		} else if (data) {
			subject.is_favorite = data.is_favorite;
			await loadData(); // Reload to sort
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-3xl font-bold">{$_('subjects.title')}</h1>
		{#if $isAdmin && semesters.length > 0}
			<Button variant="primary" onclick={openCreateModal}>
				<div class="flex items-center gap-2">
                    <Icon name="add" size={20} />
				    {$_('subjects.create')}
                </div>
			</Button>
		{/if}
	</div>

	<div class="sticky top-0 bg-surface-50 dark:bg-surface-900 z-10 py-2">
		<Input type="search" bind:value={searchQuery} placeholder={$_('search.placeholder')} />
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
		</div>
	{:else if semesters.length === 0}
		<!-- No semesters state -->
		<div class="empty-state">
			<h3 class="empty-title">{$_('subjects.noSemestersAvailable')}</h3>
			<p class="empty-description">{$_('subjects.createSemestersFirst')}</p>
			<div class="flex gap-3 justify-center">
				<a href="/semesters">
					<Button variant="primary">{$_('subjects.goToSemesters')}</Button>
				</a>
			</div>
		</div>
	{:else if groupedSubjects.length === 0}
		<div class="empty-state">
			<h3 class="empty-title">{$_('subjects.noSubjects')}</h3>
			{#if $isAdmin}
				<div class="flex gap-3 justify-center mt-4">
					<Button variant="primary" size="lg" onclick={openCreateModal}>
						<div class="flex items-center gap-2">
                            <Icon name="add" size={24} />
						    {$_('subjects.createFirst')}
                        </div>
					</Button>
				</div>
			{:else}
				<p class="empty-description">{$_('subjects.noSubjects')}</p>
			{/if}
		</div>
	{:else}
		<div class="space-y-8">
			{#each groupedSubjects as group (group.semester.id)}
				<section>
					<div class="flex items-baseline gap-3 mb-4 border-b border-surface-200 dark:border-surface-700 pb-2">
						<h2 class="text-2xl font-bold text-primary-600 dark:text-primary-400">
							{group.semester.name_cs}
						</h2>
						<span class="text-surface-500 dark:text-surface-400 text-lg">
							{group.semester.name_en}
						</span>
					</div>

					<div class="grid gap-4" use:staggerFadeIn>
						{#each group.subjects as subject (subject.id)}
							<div 
								role="button"
								tabindex="0"
								onclick={() => goto(`/subjects/${subject.id}`)}
								onkeydown={(e) => e.key === 'Enter' && goto(`/subjects/${subject.id}`)}
								class="block bg-surface-50 dark:bg-surface-800 rounded-lg p-5 border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="flex items-center gap-3 mb-2">
											<span class="font-mono font-bold bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded text-sm">
												{subject.code}
											</span>
											<h3 class="text-xl font-semibold flex items-center gap-2">
												{subject.name_cs}
												<button 
													class="hover:scale-110 transition-transform btn-icon p-1 z-20 relative" 
													onclick={(e) => { 
														e.stopPropagation(); 
														toggleFavorite(subject); 
													}}
													title="Toggle Favorite"
												>
													{#if subject.is_favorite}
														<Icon name="star" size={20} className="text-yellow-400 fill-yellow-400" />
													{:else}
														<Icon name="star" size={20} className="text-surface-300 hover:text-yellow-400" />
													{/if}
												</button>
											</h3>
											<span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium">
												{subject.credits} kr.
											</span>
										</div>
										<p class="text-surface-600 dark:text-surface-300 font-medium mb-1">{subject.name_en}</p>
										
										{#if subject.teachers && subject.teachers.length > 0}
											<div class="mt-3 flex flex-wrap gap-2">
												{#each subject.teachers as teacher}
													<div class="text-sm bg-surface-100 dark:bg-surface-900 px-2 py-1 rounded border border-surface-200 dark:border-surface-700 flex items-center gap-1">
														<Icon name="user" size={16} />
														<span>{teacher.teacher_name}</span>
													</div>
												{/each}
											</div>
										{/if}
									</div>

									{#if $isAdmin}
										<div class="flex items-center gap-2 ml-4 relative z-20" onclick={(e) => e.stopPropagation()}>
											<Button variant="ghost" size="sm" onclick={() => openEditModal(subject)} aria-label={$_('common.edit')}>
												<Icon name="edit" size={20} />
											</Button>
											{#if deleteConfirm === subject.id}
												<Button variant="danger" size="sm" onclick={() => handleDelete(subject.id)}>
													{$_('common.confirm')}
												</Button>
												<Button variant="ghost" size="sm" onclick={() => deleteConfirm = null}>
													{$_('common.cancel')}
												</Button>
											{:else}
												<Button variant="ghost" size="sm" onclick={() => deleteConfirm = subject.id} aria-label={$_('common.delete')}>
													<Icon name="delete" size={20} />
												</Button>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<div class="dialog-backdrop fixed inset-0 flex items-center justify-center z-50 p-4" onclick={closeModal}>
		<div class="modal-content bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onclick={(e) => e.stopPropagation()}>
			<h2 class="text-xl font-bold mb-4">
				{editingSubject ? $_('subjects.edit') : $_('subjects.create')}
			</h2>
			
			{#if error}
				<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">
					{error}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="md:col-span-2">
						<label for="semester" class="block text-sm font-medium mb-1 text-adaptive-primary">{$_('subjects.semester')}</label>
						<select
							id="semester"
							bind:value={formSemesterID}
							class="w-full px-3 py-2 border rounded-lg bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
						>
							{#each semesters as semester}
								<option value={semester.id}>{semester.name_cs}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="code" class="block text-sm font-medium mb-1 text-adaptive-primary">{$_('subjects.codeShort')}</label>
						<input
							id="code"
							type="text"
							bind:value={formCode}
							maxlength="6"
							class="w-full px-3 py-2 border rounded-lg bg-adaptive-tertiary text-adaptive-primary border-adaptive font-mono uppercase focus:outline-none focus:ring-2 focus:ring-accent-primary"
							placeholder="CS101"
						/>
					</div>

					<div>
						<label for="credits" class="block text-sm font-medium mb-1 text-adaptive-primary">{$_('subjects.credits')}</label>
						<input
							id="credits"
							type="number"
							bind:value={formCredits}
							min="0"
							class="w-full px-3 py-2 border rounded-lg bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
						/>
					</div>

					<div class="md:col-span-2">
						<label for="name_cs" class="block text-sm font-medium mb-1 text-adaptive-primary">{$_('common.name_czech')}</label>
						<input
							id="name_cs"
							type="text"
							bind:value={formNameCS}
							class="w-full px-3 py-2 border rounded-lg bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
						/>
					</div>

					<div class="md:col-span-2">
						<label class="block text-sm font-medium mb-2 text-adaptive-primary">{$_('subjects.teachers')}</label>
						{#each formTeachers as teacher, i}
							<div class="flex gap-2 mb-2 items-start">
								<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
									<input
										type="text"
										bind:value={teacher.name}
										placeholder="Jméno"
										class="w-full px-2 py-1 text-sm border rounded bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
									/>
									<input
										type="text"
										bind:value={teacher.topic_cs}
										placeholder="Téma"
										class="w-full px-2 py-1 text-sm border rounded bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
									/>
								</div>
								<button type="button" class="text-red-500 hover:text-red-700 px-2" onclick={() => removeTeacher(i)}>
									✕
								</button>
							</div>
						{/each}
						<button type="button" class="text-sm text-primary-600 hover:text-primary-800 font-medium mt-1" onclick={addTeacher}>
							+ {$_('common.add_teacher')}
						</button>
					</div>

					<div class="md:col-span-2">
						<label for="desc_cs" class="block text-sm font-medium mb-1 text-adaptive-primary">{$_('common.description_czech')}</label>
						<textarea
							id="desc_cs"
							bind:value={formDescCS}
							rows="3"
							class="w-full px-3 py-2 border rounded-lg bg-adaptive-tertiary text-adaptive-primary border-adaptive focus:outline-none focus:ring-2 focus:ring-accent-primary"
						></textarea>
					</div>
				</div>

				<div class="flex justify-end gap-3 mt-6 border-t pt-4 dark:border-surface-700">
					<Button variant="ghost" onclick={closeModal}>{$_('common.cancel')}</Button>
					<Button variant="primary" type="submit" loading={submitting}>
						{editingSubject ? $_('common.update') : $_('subjects.create')}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
