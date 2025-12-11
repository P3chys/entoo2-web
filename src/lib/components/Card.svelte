<script lang="ts">
	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class="card {className}">
	{@render children?.()}
</div>
