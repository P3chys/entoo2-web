<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth';
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import { fade } from 'svelte/transition';

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
			// Redirect to email verification page instead of auto-login
			goto('/verify-email?registered=true');
		}
	}
</script>

<div class="min-h-screen flex flex-col md:flex-row" in:fade={{ duration: 200 }}>
	<!-- Brand Side (Left) - Hidden on mobile, gradient on desktop -->
	<div class="hidden md:flex md:w-1/2 lg:w-2/5 auth-brand items-center justify-center p-12">
		<div class="max-w-md text-white">
			<!-- Logo/Icon -->
			<div class="mb-8">
				<svg
					class="w-16 h-16 mb-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			</div>

			<!-- Brand Title and Tagline -->
			<h1 class="text-4xl font-bold mb-4">{$_('common.appName')}</h1>
			<p class="text-xl opacity-90 mb-6">{$_('auth.tagline')}</p>
			<p class="opacity-80 leading-relaxed">
				{$_('auth.description')}
			</p>

			<!-- Features List -->
			<div class="mt-8 space-y-3">
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{$_('auth.feature1')}</span>
				</div>
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{$_('auth.feature2')}</span>
				</div>
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{$_('auth.feature3')}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Form Side (Right) -->
	<div class="flex-1 flex items-center justify-center p-6 md:p-12 bg-light-bg-primary dark:bg-dark-bg-primary">
		<div class="w-full max-w-md">
			<!-- Mobile Logo -->
			<div class="md:hidden mb-8 text-center">
				<h1 class="text-3xl font-bold text-accent-primary mb-2">{$_('common.appName')}</h1>
				<p class="text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.tagline')}
				</p>
			</div>

			<!-- Form Header -->
			<div class="mb-8">
				<h2 class="text-3xl font-bold mb-2">{$_('auth.register')}</h2>
				<p class="text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.registerMessage')}
				</p>
			</div>

			<!-- Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-5">
				{#if generalError}
					<div
						class="p-4 bg-error/10 border border-error rounded-lg text-error"
						role="alert"
						in:fade={{ duration: 200 }}
					>
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
							<p>{generalError}</p>
						</div>
					</div>
				{/if}

				<Input
					type="email"
					label={$_('auth.email')}
					bind:value={email}
					error={emailError}
					placeholder="student@example.com"
					autocomplete="email"
					required
				/>

				<Input
					type="password"
					label={$_('auth.password')}
					bind:value={password}
					error={passwordError}
					placeholder="••••••••"
					autocomplete="new-password"
					required
				/>

				<Input
					type="password"
					label={$_('auth.confirmPassword')}
					bind:value={confirmPassword}
					error={confirmPasswordError}
					placeholder="••••••••"
					autocomplete="new-password"
					required
				/>

				<Button type="submit" variant="primary" fullWidth {loading}>
					{$_('auth.register')}
				</Button>
			</form>

			<!-- Footer -->
			<div class="mt-6 text-center">
				<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.haveAccount')}
					<a href="/login" class="link font-medium">
						{$_('auth.login')}
					</a>
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.auth-brand {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
</style>
