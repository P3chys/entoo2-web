<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { slide, fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import type { Comment, User } from '$types';

	export let subjectId: string;
	export let currentUser: User | undefined = undefined;

	let comments: Comment[] = [];
	let content = '';
	let isAnonymous = false;
	let loading = true;
	let submitting = false;
	let error = '';

	async function loadComments() {
		loading = true;
		const res = await api.get<{ success: boolean; data: Comment[] }>(`/api/v1/subjects/${subjectId}/comments`);
		if (res.data?.success) {
			comments = res.data.data;
		}
		loading = false;
	}

	async function handleSubmit() {
		if (!content.trim()) return;

		submitting = true;
		error = '';

		const res = await api.post<{ success: boolean; data: Comment }>(`/api/v1/subjects/${subjectId}/comments`, {
			content,
			is_anonymous: isAnonymous
		});

		if (res.data?.success) {
			comments = [res.data.data, ...comments];
			content = '';
			isAnonymous = false;
		} else {
			error = res.error?.message || 'Failed to post comment';
		}

		submitting = false;
	}

	async function handleDelete(id: string) {
		if (!confirm($_('common.confirmDelete'))) return;

		const res = await api.delete<{ success: boolean }>(`/api/v1/comments/${id}`);
		if (res.data?.success) {
			comments = comments.filter(c => c.id !== id);
		} else {
			alert(res.error?.message || 'Failed to delete comment');
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString();
	}

	onMount(() => {
		loadComments();
	});
</script>

<div class="h-full flex flex-col bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl overflow-hidden border border-light-border-primary dark:border-dark-border-primary">
	<!-- Header -->
	<div class="p-4 border-b border-light-border-primary dark:border-dark-border-primary flex items-center justify-between bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
		<h3 class="font-bold flex items-center gap-2">
			<Icon name="message-square" size={20} className="text-accent-primary" />
			{$_('comments.title', { default: 'Comments' })}
		</h3>
		<span class="text-xs bg-light-bg-primary dark:bg-dark-bg-primary px-2 py-1 rounded-full text-light-text-secondary dark:text-dark-text-secondary">
			{comments.length}
		</span>
	</div>

	<!-- Comments List -->
	<div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[600px] lg:max-h-[calc(100vh-300px)]">
		{#if loading}
			<div class="flex justify-center py-8">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
			</div>
		{:else if comments.length === 0}
			<div class="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary italic">
				{$_('comments.empty', { default: 'No comments yet. Be the first!' })}
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<div class="group relative bg-light-bg-primary dark:bg-dark-bg-primary p-3 rounded-lg border border-light-border-primary dark:border-dark-border-primary" transition:slide>
					<div class="flex items-start justify-between gap-2 mb-1">
						<div class="flex items-center gap-2">
							<div class="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-bold text-accent-primary">
								{#if comment.is_anonymous}
									?
								{:else}
									{comment.user?.display_name?.charAt(0) || '?'}
								{/if}
							</div>
							<span class="text-sm font-medium {comment.is_anonymous ? 'text-light-text-tertiary dark:text-dark-text-tertiary italic' : ''}">
								{comment.is_anonymous ? $_('comments.anonymous', { default: 'Anonymous Student' }) : comment.user?.display_name}
							</span>
						</div>
						<span class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
							{formatDate(comment.created_at)}
						</span>
					</div>

					<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary ml-8 whitespace-pre-wrap">{comment.content}</p>

					{#if currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin')}
						<button 
							onclick={() => handleDelete(comment.id)}
							class="absolute top-2 right-2 p-1 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
							title={$_('common.delete')}
						>
							<Icon name="trash" size={14} />
						</button>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Input Area -->
	<div class="p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-t border-light-border-primary dark:border-dark-border-primary">
		{#if error}
			<div class="text-red-500 text-xs mb-2" transition:slide>{error}</div>
		{/if}
		
		<div class="relative">
			<textarea
				bind:value={content}
				placeholder={$_('comments.placeholder', { default: 'Write a comment...' })}
				class="w-full bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none resize-none min-h-[80px]"
				disabled={submitting}
			></textarea>
		</div>

		<div class="flex items-center justify-between mt-2">
			<label class="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer select-none">
				<input type="checkbox" bind:checked={isAnonymous} class="rounded text-accent-primary focus:ring-accent-primary" />
				{$_('comments.postAnonymously', { default: 'Post Anonymously' })}
			</label>

			<Button 
				variant="primary" 
				size="sm" 
				disabled={!content.trim() || submitting}
				onclick={handleSubmit}
			>
				{submitting ? $_('common.sending', { default: 'Sending...' }) : $_('common.send', { default: 'Send' })}
			</Button>
		</div>
	</div>
</div>
