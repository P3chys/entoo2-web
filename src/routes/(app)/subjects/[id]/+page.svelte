<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import { currentUser as user } from '$stores/auth';
	import FileUpload from '$components/FileUpload.svelte';
	import DocumentList from '$components/DocumentList.svelte';
	import CategoryManager from '$components/CategoryManager.svelte';
	import QuestionList from '$components/QuestionList.svelte';
	import CommentSection from '$components/CommentSection.svelte';
	import Icon from '$components/Icon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import Button from '$lib/components/Button.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { fadeSlideIn, slideInFrom, staggerFadeIn, bounceIn } from '$lib/utils/animation';
	import type { Subject, Document } from '$types';

	let subject: Subject | null = $state(null);
	let documents: Document[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let showCategoryManager = $state(false);

	let activeTab = $state('profile');

	const isAdmin = $derived($user?.role === 'admin');

	const subjectId = $page.params.id;

	async function loadData() {
		loading = true;
		const [subjectRes, documentsRes] = await Promise.all([
			api.get<{ success: boolean; data: Subject }>(`/api/v1/subjects/${subjectId}`),
			api.get<{ success: boolean; data: Document[] }>(`/api/v1/subjects/${subjectId}/documents`)
		]);

		if (subjectRes.error) {
			error = subjectRes.error.message || $_('common.failed_to_load_subject');
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
		alert(msg);
	}

	function handleDelete(docId: string) {
		documents = documents.filter(d => d.id !== docId);
	}

	onMount(() => {
		loadData();
	});

	async function toggleFavorite() {
		const { error, data } = await api.post<{ success: boolean; is_favorite: boolean }>(`/api/v1/subjects/${subject.id}/favorite`, {});
		if (!error && data) {
			subject.is_favorite = data.is_favorite;
		}
	}

	const tabs = [
		{ id: 'profile', icon: 'user', label: 'common.tab_profile' },
		{ id: 'documents', icon: 'document', label: 'common.tab_documents' },
		{ id: 'flashcards', icon: 'layers', label: 'common.tab_flashcards' },
		{ id: 'questions', icon: 'questions', label: 'common.tab_questions' },
		{ id: 'messages', icon: 'message', label: 'common.tab_messages' }
	];

	// Navigate to flashcards page when flashcards tab is selected
	$effect(() => {
		if (activeTab === 'flashcards' && subject) {
			goto(`/subjects/${subject.id}/flashcards`);
		}
	});
</script>

<div class="h-full flex flex-col" in:fade={{ duration: 200 }}>
	<!-- Back link -->
	<div class="mb-4" use:fadeSlideIn>
		<a href="/subjects" class="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors group">
			<Icon name="arrow-left" size={16} className="group-hover:-translate-x-1 transition-transform" />
			{$_('common.back')}
		</a>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner />
		</div>
	{:else if error}
		<div class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
			{error}
		</div>
	{:else if subject}
		<!-- Header (Always visible) -->
		<div class="mb-6 card p-6" use:slideInFrom={{ direction: 'top', delay: 100 }}>
			<div class="flex items-center gap-3 mb-2 flex-wrap">
				<span class="font-mono font-bold bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-lg text-sm">
					{subject.code}
				</span>
				<h1 class="text-3xl font-bold flex items-center gap-2">
					<Icon name="subjects" size={32} className="text-accent-primary" />
					{subject.name_cs}
					<button 
						class="hover:scale-110 transition-transform ml-2" 
						onclick={toggleFavorite}
						title="Toggle Favorite"
					>
						{#if subject.is_favorite}
							<Icon name="star" size={28} className="text-yellow-400 fill-yellow-400" />
						{:else}
							<Icon name="star" size={28} className="text-light-text-secondary/30 hover:text-yellow-400" />
						{/if}
					</button>
				</h1>
				<span class="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium flex items-center gap-1">
					<Icon name="award" size={14} />
					{subject.credits} kr.
				</span>
				{#if $user?.role === 'admin'}
					<a
						href="/subjects/{subject.id}/edit"
						class="btn-secondary text-xs py-1.5 px-3 flex items-center gap-2"
					>
						<Icon name="edit" size={14} />
						{$_('common.edit_subject')}
					</a>
				{/if}
			</div>
			<h2 class="text-xl text-light-text-secondary dark:text-dark-text-secondary">{subject.name_en}</h2>
		</div>

		<!-- Tabs -->
		<div class="flex border-b border-light-border-primary dark:border-dark-border-primary mb-6 overflow-x-auto" use:fadeSlideIn={{ delay: 200 }}>
			{#each tabs as tab}
				<button
					class="px-6 py-3 font-medium text-sm transition-all duration-200 relative whitespace-nowrap flex items-center gap-2 {activeTab === tab.id ? 'text-accent-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'}"
					onclick={() => activeTab = tab.id}
				>
					<Icon name={tab.icon} size={16} />
					{$_(tab.label)}
					{#if activeTab === tab.id}
						<div class="absolute bottom-0 left-0 w-full h-[3px] bg-accent-primary" transition:fade={{ duration: 150 }}></div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		<div class="min-h-[400px]">
			{#if activeTab === 'profile'}
				<div in:fadeSlideIn={{ delay: 100 }}>
					<div class="card p-6 space-y-6">
						<div>
							<h3 class="text-lg font-bold mb-3 flex items-center gap-2">
								<Icon name="info" size={20} className="text-accent-primary" />
								{$_('subjects.description') || 'Description'}
							</h3>
							{#if subject.description_cs || subject.description_en}
								<div class="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary text-sm space-y-4">
									<div class="rich-content">{@html subject.description_cs}</div>
									{#if subject.description_en}
										<div class="text-light-text-tertiary dark:text-dark-text-tertiary italic rich-content">{@html subject.description_en}</div>
									{/if}
								</div>
							{:else}
								<p class="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">{$_('subjects.noDescription')}</p>
							{/if}
						</div>

						{#if subject.teachers && subject.teachers.length > 0}
							<div>
								<h3 class="text-lg font-bold mb-3 flex items-center gap-2">
									<Icon name="users" size={20} className="text-accent-primary" />
									{$_('subjects.teachers') || 'Teachers'}
								</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3" use:staggerFadeIn>
									{#each subject.teachers as teacher}
										<div class="text-sm bg-light-bg-tertiary dark:bg-dark-bg-tertiary px-4 py-3 rounded-lg border border-light-border-primary dark:border-dark-border-primary hover:shadow-md transition-shadow">
											<div class="flex items-start gap-3 mb-2">
												<div class="bg-accent-primary/10 p-2 rounded-full">
													<Icon name="user" size={16} className="text-accent-primary" />
												</div>
												<div class="flex flex-col flex-1">
													<span class="font-medium">{teacher.teacher_name}</span>
													{#if teacher.topic_cs}
														<span class="text-light-text-tertiary dark:text-dark-text-tertiary text-xs">{teacher.topic_cs}</span>
													{/if}
												</div>
											</div>
											<div class="ml-11">
												<StarRating
													teacherId={teacher.id}
													averageRating={teacher.average_rating}
													totalRatings={teacher.total_ratings}
													userRating={teacher.user_rating}
													onRatingChange={loadData}
												/>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else if activeTab === 'documents'}
				<div class="space-y-6" in:fadeSlideIn={{ delay: 100 }}>
					<div class="flex items-center justify-between">
						<h2 class="text-2xl font-bold flex items-center gap-2">
							<Icon name="document" size={24} className="text-accent-primary" />
							{$_('documents.title')}
						</h2>
						<div class="flex items-center gap-3">
							{#if isAdmin}
								<Button
									variant="ghost"
									size="sm"
									onclick={() => showCategoryManager = true}
								>
									<Icon name="settings" size={16} />
									{$_('documents.manageCategories')}
								</Button>
							{/if}
							<span class="text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary px-3 py-1 rounded-full border border-light-border-primary dark:border-dark-border-primary font-medium">
								{documents.length} {documents.length === 1 ? 'document' : 'documents'}
							</span>
						</div>
					</div>

					<div class="card p-6">
						<DocumentList
							subjectId={subject.id}
							documents={documents}
							currentUserId={$user?.id}
							{isAdmin}
							onDelete={handleDelete}
							onRefresh={loadData}
						/>

						<div class="mt-8 p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl border border-dashed border-light-border-secondary dark:border-dark-border-secondary">
							<FileUpload
								subjectId={subject.id}
								onSuccess={handleUploadSuccess}
								onError={handleUploadError}
							/>
						</div>
					</div>
				</div>

				<!-- Category Manager Modal -->
				<CategoryManager
					subjectId={subject.id}
					isOpen={showCategoryManager}
					onClose={() => showCategoryManager = false}
					onUpdate={loadData}
				/>
			{:else if activeTab === 'questions'}
				<div in:fadeSlideIn={{ delay: 100 }}>
					<div class="card p-6">
						<QuestionList 
							subjectId={subject.id} 
							currentUser={$user}
						/>
					</div>
				</div>
			{:else if activeTab === 'messages'}
				<div class="grid grid-cols-1 lg:grid-cols-4 gap-6" in:fadeSlideIn={{ delay: 100 }}>
					<div class="lg:col-span-3">
						<CommentSection subjectId={subject.id} currentUser={$user} />
					</div>
					<div class="hidden lg:block lg:col-span-1">
						<!-- Optional sidebar for messages tab context if needed, otherwise full width or constrained -->
						<div class="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
							<div class="flex items-center gap-2 font-bold mb-2">
								<Icon name="info" size={16} />
								{$_('common.info')}
							</div>
							<p>{$_('subjects.discussionInfo', { values: { code: subject.code } })}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
