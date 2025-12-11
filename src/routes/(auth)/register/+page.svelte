<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth';
	import Card from '$components/Card.svelte';
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let confirmPasswordError = $state('');
	let generalError = $state('');
	let loading = $state(false);

	function validateForm(): boolean {
		let isValid = true;
		emailError = '';
		passwordError = '';
		confirmPasswordError = '';
		generalError = '';

		if (!email) {
			emailError = $_('auth.emailRequired');
			isValid = false;
		}

		if (!password) {
			passwordError = $_('auth.passwordRequired');
			isValid = false;
		}

		if (password !== confirmPassword) {
			confirmPasswordError = $_('auth.passwordMismatch');
			isValid = false;
		}

		return isValid;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		loading = true;
		const { data, error } = await authStore.register({ email, password });
		loading = false;

		if (error) {
			generalError = error.message || $_('auth.registerError');
			return;
		}

		if (data) {
			goto('/');
		}
	}
</script>

<Card>
	<h2 class="text-2xl font-bold mb-6">{$_('auth.register')}</h2>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		{#if generalError}
			<div class="p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
				{generalError}
			</div>
		{/if}

		<Input
			type="email"
			label={$_('auth.email')}
			bind:value={email}
			error={emailError}
			placeholder="student@example.com"
			required
		/>

		<Input
			type="password"
			label={$_('auth.password')}
			bind:value={password}
			error={passwordError}
			placeholder="••••••••"
			required
		/>

		<Input
			type="password"
			label={$_('auth.confirmPassword')}
			bind:value={confirmPassword}
			error={confirmPasswordError}
			placeholder="••••••••"
			required
		/>

		<Button type="submit" variant="primary" class="w-full" {loading}>
			{$_('auth.register')}
		</Button>
	</form>

	<div class="mt-6 text-center text-sm">
		<span class="text-light-text-secondary dark:text-dark-text-secondary">
			{$_('auth.haveAccount')}
		</span>
		<a href="/login" class="ml-1 link">
			{$_('auth.login')}
		</a>
	</div>
</Card>
