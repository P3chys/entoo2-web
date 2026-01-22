<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import { s, cx } from '$styles';

	interface Props {
		href?: string;
		icon?: string;
		title: string;
		description?: string;
		chevron?: boolean;
		class?: string;
	}

	let { href, icon, title, description, chevron = true, class: className }: Props = $props();

	const baseClass = cx(
		s.row.md,
		s.pad.sm,
		'group rounded-lg no-underline',
		s.hover,
		'border-l-4 border-transparent hover:border-accent-primary hover:shadow-md transition-all',
		className
	);
</script>

{#if href}
	<a {href} class={baseClass}>
		{#if icon}
			<Icon name={icon} size={24} className="text-accent-primary" />
		{/if}
		<div class="flex-1 min-w-0">
			<span class={cx(s.text.body, 'block font-medium group-hover:text-accent-primary transition-colors')}>
				{title}
			</span>
			{#if description}
				<span class={cx(s.text.hint, 'block truncate')}>{description}</span>
			{/if}
		</div>
		{#if chevron}
			<Icon name="chevron-right" size={16} className="text-adaptive-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
		{/if}
	</a>
{:else}
	<div class={baseClass}>
		{#if icon}
			<Icon name={icon} size={24} className="text-accent-primary" />
		{/if}
		<div class="flex-1 min-w-0">
			<span class={cx(s.text.body, 'block font-medium')}>{title}</span>
			{#if description}
				<span class={cx(s.text.hint, 'block truncate')}>{description}</span>
			{/if}
		</div>
	</div>
{/if}
