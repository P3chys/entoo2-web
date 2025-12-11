<script lang="ts">
	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'search';
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		oninput?: (event: Event) => void;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		label = '',
		error = '',
		disabled = false,
		required = false,
		class: className = '',
		oninput
	}: Props = $props();
</script>

<div class="w-full {className}">
	{#if label}
		<label class="block text-sm font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
			{label}
			{#if required}
				<span class="text-error">*</span>
			{/if}
		</label>
	{/if}
	<input
		{type}
		{placeholder}
		{disabled}
		{required}
		bind:value
		{oninput}
		class="input {error ? 'border-error focus:ring-error' : ''}"
	/>
	{#if error}
		<p class="mt-1 text-sm text-error">{error}</p>
	{/if}
</div>
