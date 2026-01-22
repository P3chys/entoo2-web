<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import { s, cx } from '$styles';

	interface Props {
		icon?: string;
		title: string;
		description?: string;
		children?: any;
	}

	let { icon, title, description, children }: Props = $props();
</script>

<div class={cx(s.center, s.stack.md, s.pad.xl, 'text-center')}>
	{#if icon}
		<Icon name={icon} size={64} className="text-adaptive-tertiary opacity-50" />
	{/if}

	<div>
		<h3 class={cx(s.text.md, 'mb-1')}>{title}</h3>
		{#if description}
			<p class={cx(s.text.muted, 'max-w-sm mx-auto')}>{description}</p>
		{/if}
	</div>

	{#if children}
		<div class={cx(s.row.md, 'mt-4')}>
			{@render children?.()}
		</div>
	{/if}
</div>
