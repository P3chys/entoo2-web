<script lang="ts">
	import { toasts } from '$stores/toast';
	import Toast from './Toast.svelte';
</script>

<div class="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div class="pointer-events-auto">
			<Toast
				type={toast.type}
				message={toast.message}
				duration={toast.duration}
				onClose={() => toasts.remove(toast.id)}
			/>
		</div>
	{/each}
</div>
