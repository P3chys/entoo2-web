<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import { s, cx } from '$styles';

	interface Props {
		href?: string;
		icon: string;
		title: string;
		description?: string;
		time?: string;
	}

	let { href, icon, title, description, time }: Props = $props();

	const wrapperClass = cx(
		s.row.md,
		'py-3 px-3 -mx-3 rounded-lg',
		'border-b border-adaptive-secondary last:border-0',
		href && cx(s.hover, 'hover:shadow-sm transition-all')
	);
</script>

{#if href}
	<a {href} class="block no-underline">
		<div class={wrapperClass}>
			<div class="p-2 rounded-lg bg-accent-primary/10">
				<Icon name={icon} size={20} className="text-accent-primary" />
			</div>
			<div class="flex-1 min-w-0">
				<p class={cx(s.text.body, 'font-medium truncate')}>{title}</p>
				{#if description}
					<p class={cx(s.text.muted, 'truncate')}>{description}</p>
				{/if}
			</div>
			{#if time}
				<span class={cx(s.text.hint, 'whitespace-nowrap')}>{time}</span>
			{/if}
		</div>
	</a>
{:else}
	<div class={wrapperClass}>
		<div class="p-2 rounded-lg bg-accent-primary/10">
			<Icon name={icon} size={20} className="text-accent-primary" />
		</div>
		<div class="flex-1 min-w-0">
			<p class={cx(s.text.body, 'font-medium truncate')}>{title}</p>
			{#if description}
				<p class={cx(s.text.muted, 'truncate')}>{description}</p>
			{/if}
		</div>
		{#if time}
			<span class={cx(s.text.hint, 'whitespace-nowrap')}>{time}</span>
		{/if}
	</div>
{/if}
