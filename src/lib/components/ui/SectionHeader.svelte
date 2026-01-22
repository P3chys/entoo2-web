<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import { s, cx } from '$styles';

	interface Props {
		icon?: string;
		class?: string;
		children: any;
	}

	let { icon, class: className, children }: Props = $props();
</script>

<h2 class={cx(s.row.sm, s.text.md, 'mb-4', className)}>
	{#if icon}
		<Icon name={icon} size={20} className="text-accent-primary" />
	{/if}
	{@render children?.()}
</h2>
