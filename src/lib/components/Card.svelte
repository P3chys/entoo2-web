<script lang="ts">
    import { fadeSlideIn, hoverScale } from '$lib/utils/animation';
	interface Props {
		class?: string;
		children?: any;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class="card {className}" use:fadeSlideIn use:hoverScale>
	{@render children?.()}
</div>
