<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { slide, fade } from 'svelte/transition';
	import { api } from '$lib/utils/api';
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';
	import Badge from './ui/Badge.svelte';
	import UserInfo from './composite/UserInfo.svelte';
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
		const res = await api.get<{ success: boolean; data: Comment[] }>(
			`/api/v1/subjects/${subjectId}/comments`
		);
		if (res.data?.success) {
			comments = res.data.data;
		}
		loading = false;
	}

	async function handleSubmit() {
		if (!content.trim()) return;

		submitting = true;
		error = '';

		const res = await api.post<{ success: boolean; data: Comment }>(
			`/api/v1/subjects/${subjectId}/comments`,
			{
				content,
				is_anonymous: isAnonymous
			}
		);

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
			comments = comments.filter((c) => c.id !== id);
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

<div
	class="h-full flex flex-col bg-adaptive-secondary rounded-xl overflow-hidden border border-adaptive"
>
	<!-- Header -->
	<div class="p-4 border-b border-adaptive flex-between bg-adaptive-tertiary">
		<h3 class="font-bold flex-gap-2">
			<Icon name="message-square" size={20} className="text-accent-primary" />
			{$_('comments.title', { default: 'Comments' })}
		</h3>
		<Badge variant="primary" size="sm">
			{comments.length}
		</Badge>
	</div>

	<!-- Comments List -->
	<div
		class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[600px] lg:max-h-[calc(100vh-300px)]"
	>
		{#if loading}
			<div class="flex justify-center py-8">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
			</div>
		{:else if comments.length === 0}
			<div class="text-center py-8 text-adaptive-tertiary italic">
				{$_('comments.empty', { default: 'No comments yet. Be the first!' })}
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<div
					class="group relative bg-adaptive-primary p-3 rounded-lg border border-adaptive"
					transition:slide
				>
					<div class="flex items-start justify-between gap-2 mb-2">
						<UserInfo
							user={comment.user}
							anonymous={comment.is_anonymous}
							timestamp={comment.created_at}
							formatTimestamp={formatDate}
							anonymousLabel={$_('comments.anonymous', { default: 'Anonymous Student' })}
							avatarSize="xs"
						/>
					</div>

					<p class="text-sm text-adaptive-secondary ml-8 whitespace-pre-wrap">{comment.content}</p>

					{#if currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin')}
						<button
							onclick={() => handleDelete(comment.id)}
							class="absolute top-2 right-2 p-1 text-adaptive-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
	<div class="p-4 bg-adaptive-tertiary border-t border-adaptive">
		{#if error}
			<div class="text-red-500 text-xs mb-2" transition:slide>{error}</div>
		{/if}

		<div class="relative">
			<textarea
				bind:value={content}
				placeholder={$_('comments.placeholder', { default: 'Napiš komentář...' })}
				class="w-full bg-adaptive-primary border border-adaptive rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none resize-none min-h-[80px]"
				disabled={submitting}
			></textarea>
		</div>

		<div class="flex-between mt-2">
			<label class="flex-gap-2 text-sm text-adaptive-secondary cursor-pointer select-none">
				<input
					type="checkbox"
					bind:checked={isAnonymous}
					class="rounded text-accent-primary focus:ring-accent-primary"
				/>
				{$_('comments.postAnonymously', { default: 'Post Anonymously' })}
			</label>

			<Button
				variant="primary"
				size="sm"
				disabled={!content.trim() || submitting}
				onclick={handleSubmit}
			>
				{submitting
					? $_('common.sending', { default: 'Sending...' })
					: $_('common.send', { default: 'Send' })}
			</Button>
		</div>
	</div>
</div>
