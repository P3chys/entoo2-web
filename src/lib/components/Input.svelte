<script lang="ts">
	import { generateId } from '$lib/utils/id';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		helpText?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		ariaLabel?: string;
		autocomplete?: string;
		oninput?: (event: Event) => void;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		label = '',
		error = '',
		helpText = '',
		disabled = false,
		required = false,
		class: className = '',
		ariaLabel = '',
		autocomplete = '',
		oninput
	}: Props = $props();

	// Generate unique ID for accessibility
	const id = generateId('input');
	const errorId = `${id}-error`;
	const helpId = `${id}-help`;
</script>

<div class="w-full {className}">
	{#if label}
		<label for={id} class="block text-sm font-medium mb-2 text-light-text-secondary dark:text-dark-text-secondary">
			{label}
			{#if required}
				<span class="text-error" aria-label="required">*</span>
			{/if}
		</label>
	{/if}
	<input
		{id}
		{type}
		{placeholder}
		{disabled}
		{required}
		{autocomplete}
		bind:value
		{oninput}
		aria-label={ariaLabel || label}
		aria-invalid={!!error}
		aria-describedby={error ? errorId : helpText ? helpId : undefined}
		class="input {error ? 'border-error focus:ring-error' : ''}"
	/>
	{#if helpText && !error}
		<p id={helpId} class="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
			{helpText}
		</p>
	{/if}
	{#if error}
		<p id={errorId} class="mt-1 text-sm text-error" role="alert">
			{error}
		</p>
	{/if}
</div>
