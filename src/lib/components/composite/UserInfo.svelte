<script lang="ts">
	/**
	 * UserInfo Component
	 * Displays user avatar, name, and optional timestamp
	 * Used in comments, questions, answers, etc.
	 */

	import Avatar from '../ui/Avatar.svelte';
	import type { User } from '$types';

	interface Props {
		/** User object */
		user?: User | null;
		/** Whether this is an anonymous user */
		anonymous?: boolean;
		/** Timestamp to display */
		timestamp?: string;
		/** Function to format the timestamp */
		formatTimestamp?: (ts: string) => string;
		/** Anonymous label text */
		anonymousLabel?: string;
		/** Custom CSS classes */
		class?: string;
		/** Avatar size */
		avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	}

	let {
		user = null,
		anonymous = false,
		timestamp = undefined,
		formatTimestamp = (ts: string) => new Date(ts).toLocaleString(),
		anonymousLabel = 'Anonymous',
		class: className = '',
		avatarSize = 'sm'
	}: Props = $props();

	const displayName = $derived(
		anonymous ? anonymousLabel : user?.display_name || user?.email || 'Unknown'
	);
</script>

<div class="flex-gap-2 {className}">
	<Avatar name={displayName} {anonymous} size={avatarSize} />

	<div class="flex flex-col">
		<span
			class="text-sm font-medium {anonymous
				? 'text-adaptive-tertiary italic'
				: 'text-adaptive-primary'}"
		>
			{displayName}
		</span>

		{#if timestamp}
			<span class="text-xs text-adaptive-tertiary">
				{formatTimestamp(timestamp)}
			</span>
		{/if}
	</div>
</div>
