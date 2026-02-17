<script lang="ts">
	import { _ } from 'svelte-i18n';

	interface Props {
		value?: string;
		placeholder?: string;
		loading?: boolean;
		autofocus?: boolean;
		onInput?: (value: string) => void;
		onSubmit?: (value: string) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = $_('search.placeholder'),
		loading = false,
		autofocus = false,
		onInput,
		onSubmit,
		class: className = ''
	}: Props = $props();

	let inputElement: HTMLInputElement | undefined = $state();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onInput?.(value);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSubmit?.(value);
	}

	function clearSearch() {
		value = '';
		onInput?.('');
	}

	// Handle autofocus programmatically to avoid a11y warning
	$effect(() => {
		if (autofocus && inputElement) {
			inputElement.focus();
		}
	});
</script>

<form onsubmit={handleSubmit} class="relative {className}">
	<div class="relative">
		<input
			bind:this={inputElement}
			type="search"
			bind:value
			oninput={handleInput}
			{placeholder}
			class="input pl-10 pr-10"
			aria-label={$_('common.search')}
		/>

		<!-- Search Icon -->
		<div
			class="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary"
		>
			{#if loading}
				<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			{/if}
		</div>

		<!-- Clear Button -->
		{#if value}
			<button
				type="button"
				onclick={clearSearch}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary"
				aria-label="Clear search"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>
</form>
