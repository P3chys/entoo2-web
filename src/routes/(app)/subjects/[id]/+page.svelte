<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import { currentUser as user } from '$stores/auth';
	import FileUpload from '$components/FileUpload.svelte';
	import DocumentList from '$components/DocumentList.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import { fadeSlideIn, slideInFrom, staggerFadeIn, bounceIn } from '$lib/utils/animation';
	import type { Subject, Document } from '$types';

	let subject: Subject | null = $state(null);
	let documents: Document[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	
	const subjectId = $page.params.id;

	async function loadData() {
		loading = true;
		const [subjectRes, documentsRes] = await Promise.all([
			api.get<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}`),
			api.get<{ success: boolean; data: Document[] }>(`/api/v1/subjects/${subjectId}/documents`)
		]);

		if (subjectRes.error) {
			error = subjectRes.error.message || 'Failed to load subject';
		} else if (subjectRes.data?.success) {
			subject = subjectRes.data.data;
		}

		if (documentsRes.data?.success) {
			documents = documentsRes.data.data || [];
		}

		loading = false;
	}

	function handleUploadSuccess(doc: Document) {
		documents = [doc, ...documents];
	}

	function handleUploadError(msg: string) {
		alert(msg); // Only alert for now, could act as toast
	}

	function handleDelete(docId: string) {
		documents = documents.filter(d => d.id !== docId);
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<!-- Back link -->
	<div use:fadeSlideIn>
		<a href="/subjects" class="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors group">
			<Icon name="arrow-left" size={16} className="group-hover:-translate-x-1 transition-transform" />
			{$_('common.back')}
		</a>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
		</div>
	{:else if subject}
		<!-- Header -->
		<div class="card" use:slideInFrom={{ direction: 'top', delay: 100 }}>
			<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
				<div class="flex-1">
					<div class="flex items-center gap-3 mb-2 flex-wrap">
						<span class="font-mono font-bold bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-lg text-sm">
							{subject.code}
						</span>
						<h1 class="text-3xl font-bold flex items-center gap-2">
							<Icon name="subjects" size={32} className="text-accent-primary" />
							{subject.name_cs}
						</h1>
						<span class="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium flex items-center gap-1">
							<Icon name="award" size={14} />
							{subject.credits} kr.
						</span>
					</div>
					<h2 class="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-4">{subject.name_en}</h2>

					{#if subject.description_cs || subject.description_en}
						<div class="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary text-sm space-y-2">
							<p>{subject.description_cs}</p>
							<p class="text-light-text-tertiary dark:text-dark-text-tertiary">{subject.description_en}</p>
						</div>
					{/if}

					{#if subject.teachers && subject.teachers.length > 0}
						<div class="mt-4 flex flex-wrap gap-2" use:staggerFadeIn>
							{#each subject.teachers as teacher}
								<div class="text-sm bg-light-bg-tertiary dark:bg-dark-bg-tertiary px-3 py-2 rounded-lg border border-light-border-primary dark:border-dark-border-primary flex items-center gap-2 hover:shadow-md transition-shadow">
									<Icon name="user" size={16} className="text-accent-primary" />
									<span class="font-medium">{teacher.teacher_name}</span>
									{#if teacher.topic_cs}
										<span class="text-light-text-tertiary dark:text-dark-text-tertiary mx-1">|</span>
										<span class="text-light-text-secondary dark:text-dark-text-secondary text-xs">{teacher.topic_cs}</span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Documents Section -->
		<div class="space-y-6" use:fadeSlideIn={{ delay: 200 }}>
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold flex items-center gap-2">
					<Icon name="document" size={28} className="text-accent-primary" />
					{$_('documents.title')}
				</h2>
				<span class="text-sm text-light-text-secondary dark:text-dark-text-secondary" use:bounceIn={{ delay: 400 }}>
					{documents.length} {documents.length === 1 ? 'document' : 'documents'}
				</span>
			</div>

			<div class="card" use:slideInFrom={{ direction: 'bottom', delay: 300 }}>
				<div class="mb-8">
					<FileUpload
						subjectId={subject.id}
						onSuccess={handleUploadSuccess}
						onError={handleUploadError}
					/>
				</div>

				<DocumentList
					subjectId={subject.id}
					documents={documents}
					currentUserId={$user?.id}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	{/if}
</div>
