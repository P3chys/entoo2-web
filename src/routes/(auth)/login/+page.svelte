<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { authStore } from '$stores/auth';
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import { fade } from 'svelte/transition';
	import { slideInFrom, fadeSlideIn, staggerFadeIn, shake } from '$lib/utils/animation';

	let email = $state('');
	let password = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let generalError = $state('');
	let loading = $state(false);

	function validateForm(): boolean {
		let isValid = true;
		emailError = '';
		passwordError = '';
		generalError = '';

		if (!email) {
			emailError = $_('auth.emailRequired');
			isValid = false;
		}

		if (!password) {
			passwordError = $_('auth.passwordRequired');
			isValid = false;
		}

		return isValid;
	}

	let formElement: HTMLFormElement;

	async function handleSubmit() {
		if (!validateForm()) {
			if (formElement) shake(formElement);
			return;
		}

		loading = true;
		const { data, error } = await authStore.login({ email, password });
		loading = false;

		if (error) {
			generalError = error.message || $_('auth.loginError');
			if (formElement) shake(formElement);
			return;
		}

		if (data) {
			goto('/');
		}
	}
</script>

<div class="min-h-screen flex flex-col md:flex-row" in:fade={{ duration: 200 }}>
	<!-- Brand Side (Left) - Hidden on mobile, gradient on desktop -->
	<div class="hidden md:flex md:w-1/2 lg:w-2/5 auth-brand items-center justify-center p-12" use:slideInFrom={{ direction: 'left' }}>
		<div class="max-w-md text-white">
			<!-- Logo/Icon -->
			<div class="mb-8" use:fadeSlideIn>
				<div class="w-16 h-16 mb-4 p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
					<Icon name="subjects" size={40} className="text-white" strokeWidth={1.5} />
				</div>
			</div>

			<!-- Brand Title and Tagline -->
			<div use:fadeSlideIn={{ delay: 100 }}>
				<h1 class="text-4xl font-bold mb-4">{$_('common.appName')}</h1>
				<p class="text-xl opacity-90 mb-6">{$_('auth.tagline')}</p>
				<p class="opacity-80 leading-relaxed">
					{$_('auth.description')}
				</p>
			</div>

			<!-- Features List -->
			<div class="mt-8 space-y-3" use:staggerFadeIn>
				<div class="flex items-center gap-3">
					<div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
						<Icon name="check" size={14} className="text-white" strokeWidth={3} />
					</div>
					<span>{$_('auth.feature1')}</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
						<Icon name="check" size={14} className="text-white" strokeWidth={3} />
					</div>
					<span>{$_('auth.feature2')}</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
						<Icon name="check" size={14} className="text-white" strokeWidth={3} />
					</div>
					<span>{$_('auth.feature3')}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Form Side (Right) -->
	<div class="flex-1 flex items-center justify-center p-6 md:p-12 bg-light-bg-primary dark:bg-dark-bg-primary" use:slideInFrom={{ direction: 'right' }}>
		<div class="w-full max-w-md">
			<!-- Mobile Logo -->
			<div class="md:hidden mb-8 text-center" use:fadeSlideIn>
				<div class="inline-block p-3 bg-accent-primary/10 rounded-2xl mb-4">
					<Icon name="subjects" size={40} className="text-accent-primary" />
				</div>
				<h1 class="text-3xl font-bold text-accent-primary mb-2">{$_('common.appName')}</h1>
				<p class="text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.tagline')}
				</p>
			</div>

			<!-- Form Header -->
			<div class="mb-8" use:fadeSlideIn={{ delay: 100 }}>
				<h2 class="text-3xl font-bold mb-2 flex items-center gap-2">
					<Icon name="lock" size={28} className="text-accent-primary" />
					{$_('auth.login')}
				</h2>
				<p class="text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.welcomeMessage')}
				</p>
			</div>

			<!-- Form -->
			<form bind:this={formElement} onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-5" use:fadeSlideIn={{ delay: 200 }}>
				{#if generalError}
					<div
						class="p-4 bg-error/10 border border-error rounded-lg text-error"
						role="alert"
						in:fade={{ duration: 200 }}
					>
						<div class="flex items-start gap-3">
							<Icon name="alert" size={20} className="text-error flex-shrink-0 mt-0.5" />
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
					autocomplete="current-password"
					required
				/>

				<Button type="submit" variant="primary" fullWidth {loading}>
					{$_('auth.login')}
				</Button>
			</form>

			<!-- Footer -->
			<div class="mt-6 text-center">
				<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
					{$_('auth.noAccount')}
					<a href="/register" class="link font-medium">
						{$_('auth.register')}
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
