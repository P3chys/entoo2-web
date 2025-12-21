<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { SearchResult } from '$types';
	import { formatFileSize, getFileTypeIcon, getFileTypeName } from '$lib/utils/search';

	interface Props {
		result: SearchResult;
		query?: string;
	}

	let { result, query = '' }: Props = $props();

	const isDocument = $derived(result.type === 'document');
	const href = $derived(isDocument ? `/subjects/${result.subject_id}` : `/subjects/${result.id}`);
	const displayTitle = $derived(result.title || 'Untitled');
</script>

<a
	{href}
	class="block p-4 rounded-lg border border-light-border-primary dark:border-dark-border-primary hover:border-accent-primary dark:hover:border-accent-primary transition-colors bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover no-underline"
>
	<div class="flex items-start gap-3">
		<!-- Icon -->
		<div class="text-2xl flex-shrink-0">
			{#if isDocument}
				{getFileTypeIcon(result.mime_type)}
			{:else}
				📚
			{/if}
		</div>

		<!-- Content -->
		<div class="flex-1 min-w-0">
			<!-- Title -->
			<h3 class="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
				{@html displayTitle}
			</h3>

			<!-- Metadata -->
			<div
				class="flex items-center gap-2 text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1"
			>
				<span
					class="px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-medium"
				>
					{isDocument ? $_('documents.title') : $_('subjects.title')}
				</span>

				{#if isDocument && result.file_size}
					<span>{formatFileSize(result.file_size)}</span>
				{/if}

				{#if result.code}
					<span class="font-mono">{result.code}</span>
				{/if}

				{#if result.credits}
					<span>{result.credits} kr.</span>
				{/if}

				{#if result.created_at}
					<span>{new Date(result.created_at).toLocaleDateString()}</span>
				{/if}
			</div>

			<!-- Description/Highlight -->
			{#if result.highlight || result.description}
				<p
					class="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2 line-clamp-2"
				>
					{@html result.highlight || result.description}
				</p>
			{/if}
		</div>

		<!-- Arrow -->
		<svg
			class="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 5l7 7-7 7"
			/>
		</svg>
	</div>
</a>
