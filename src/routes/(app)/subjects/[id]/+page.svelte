<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import { currentUser as user } from '$stores/auth';
	import FileUpload from '$components/FileUpload.svelte';
	import DocumentList from '$components/DocumentList.svelte';
	import Button from '$components/Button.svelte';
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

<div class="space-y-6">
	<!-- Back link -->
	<a href="/subjects" class="inline-flex items-center text-sm text-base-content/60 hover:text-primary">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
		</svg>
		{$_('common.back')}
	</a>

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
		<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
			<div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
				<div>
					<div class="flex items-center gap-3 mb-2">
						<span class="font-mono font-bold bg-surface-200 dark:bg-surface-700 px-2 py-1 rounded text-sm">
							{subject.code}
						</span>
						<h1 class="text-3xl font-bold">{subject.name_cs}</h1>
						<span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium">
							{subject.credits} kr.
						</span>
					</div>
					<h2 class="text-xl text-surface-600 dark:text-surface-300 mb-4">{subject.name_en}</h2>
					
					{#if subject.description_cs || subject.description_en}
						<div class="prose dark:prose-invert max-w-none text-base-content/80 text-sm">
							<p>{subject.description_cs}</p>
							<p class="text-base-content/60">{subject.description_en}</p>
						</div>
					{/if}

					{#if subject.teachers && subject.teachers.length > 0}
						<div class="mt-4 flex flex-wrap gap-2">
							{#each subject.teachers as teacher}
								<div class="text-sm bg-surface-100 dark:bg-surface-900 px-3 py-1.5 rounded border border-surface-200 dark:border-surface-700 flex items-center gap-2">
									<span class="text-surface-400">👤</span>
									<span class="font-medium">{teacher.teacher_name}</span>
									{#if teacher.topic_cs}
										<span class="text-surface-400 mx-1">|</span>
										<span class="text-surface-500 dark:text-surface-400 text-xs">{teacher.topic_cs}</span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Documents Section -->
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold">{$_('documents.title')}</h2>
			</div>

			<div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
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
