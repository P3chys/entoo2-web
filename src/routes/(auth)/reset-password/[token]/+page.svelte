<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import Input from '$components/Input.svelte';
	import { fade } from 'svelte/transition';
	import { slideInFrom, fadeSlideIn, shake } from '$lib/utils/animation';

	const apiUrl = env.PUBLIC_API_URL || '';
	let token = $state($page.params.token);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordError = $state('');
	let confirmPasswordError = $state('');
	let generalError = $state('');
	let loading = $state(false);
	let success = $state(false);
	let validatingToken = $state(true);
	let tokenValid = $state(false);

	let formElement = $state<HTMLFormElement>();

	onMount(async () => {
		await validateToken();
	});

	async function validateToken() {
		validatingToken = true;

		try {
			const response = await fetch(`${apiUrl}/api/v1/auth/password-reset/verify/${token}`);
			const data = await response.json();

			validatingToken = false;

			if (data.success && data.data?.valid) {
				tokenValid = true;
			} else {
				generalError = data.error?.message || $_('auth.invalidToken');
			}
		} catch (err) {
			validatingToken = false;
			generalError = $_('auth.invalidToken');
		}
	}

	function validateForm(): boolean {
		let isValid = true;
		passwordError = '';
		confirmPasswordError = '';
		generalError = '';

		if (!password) {
			passwordError = $_('auth.passwordRequired');
			isValid = false;
		} else if (password.length < 8) {
			passwordError = 'Heslo musí mít alespoň 8 znaků';
			isValid = false;
		}

		if (!confirmPassword) {
			confirmPasswordError = $_('auth.passwordRequired');
			isValid = false;
		}

		if (password && confirmPassword && password !== confirmPassword) {
			confirmPasswordError = $_('auth.passwordMismatch');
			isValid = false;
		}

		return isValid;
	}

	async function handleSubmit() {
		if (!validateForm()) {
			if (formElement) shake(formElement);
			return;
		}

		loading = true;
		generalError = '';

		try {
			const response = await fetch(`${apiUrl}/api/v1/auth/password-reset/confirm`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					new_password: password
				})
			});

			const data = await response.json();
			loading = false;

			if (data.success) {
				success = true;
				// Redirect to login after 3 seconds
				setTimeout(() => goto('/login'), 3000);
			} else {
				generalError = data.error?.message || $_('auth.passwordResetFailed');
				if (formElement) shake(formElement);
			}
		} catch (err) {
			loading = false;
			generalError = $_('auth.passwordResetFailed');
			if (formElement) shake(formElement);
		}
	}
</script>

<div class="min-h-screen flex flex-col md:flex-row" in:fade={{ duration: 200 }}>
	<!-- Brand Side (Left) - Hidden on mobile, gradient on desktop -->
	<div
		class="hidden md:flex md:w-1/2 lg:w-2/5 auth-brand items-center justify-center p-12"
		use:slideInFrom={{ direction: 'left' }}
	>
		<div class="max-w-md text-white">
			<!-- Logo/Icon -->
			<div class="mb-8" use:fadeSlideIn>
				<div class="w-16 h-16 mb-4 p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
					<Icon name="lock" size={40} className="text-white" strokeWidth={1.5} />
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
			<div class="mt-12 space-y-4" use:fadeSlideIn={{ delay: 200 }}>
				{#each [1, 2, 3] as i}
					<div class="flex items-center gap-3">
						<Icon name="check-circle" size={20} className="text-white/80" />
						<span class="opacity-90">{$_(`auth.feature${i}`)}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Form Side (Right) -->
	<div
		class="flex-1 flex items-center justify-center p-6 md:p-12"
		use:slideInFrom={{ direction: 'right' }}
	>
		<div class="w-full max-w-md">
			{#if validatingToken}
				<!-- Validating Token State -->
				<div class="text-center" use:fadeSlideIn>
					<div
						class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-accent-primary/10 rounded-full"
					>
						<Icon name="loader" size={32} className="text-accent-primary animate-spin" />
					</div>
					<h2 class="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
						{$_('auth.verifying')}
					</h2>
				</div>
			{:else if success}
				<!-- Success State -->
				<div class="text-center" use:fadeSlideIn>
					<div
						class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-success/10 rounded-full"
					>
						<Icon name="check-circle" size={32} className="text-success" />
					</div>
					<h2 class="text-3xl font-bold mb-4 text-success">
						{$_('auth.passwordResetSuccess')}
					</h2>
					<p class="text-light-text-secondary dark:text-dark-text-secondary mb-6">
						{$_('auth.passwordResetSuccessMessage')}
					</p>
					<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
						Přesměrování na přihlášení...
					</p>
				</div>
			{:else if !tokenValid}
				<!-- Invalid Token State -->
				<div class="text-center" use:fadeSlideIn>
					<div
						class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-error/10 rounded-full"
					>
						<Icon name="alert-circle" size={32} className="text-error" />
					</div>
					<h2 class="text-3xl font-bold mb-4 text-error">
						{$_('auth.verificationFailed')}
					</h2>
					<p class="text-error mb-6">{generalError}</p>

					<div class="space-y-3">
						<a
							href="/forgot-password"
							class="inline-block w-full px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors font-medium"
						>
							Požádat o nový odkaz
						</a>
						<a
							href="/login"
							class="inline-flex items-center justify-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors text-sm font-medium"
						>
							<Icon name="arrow-left" size={16} />
							{$_('auth.backToLogin')}
						</a>
					</div>
				</div>
			{:else}
				<!-- Form State -->
				<div use:fadeSlideIn>
					<!-- Mobile Logo (shown only on mobile) -->
					<div class="md:hidden mb-8 text-center">
						<div
							class="inline-flex items-center justify-center w-12 h-12 mb-3 bg-accent-primary/10 rounded-xl"
						>
							<Icon name="lock" size={24} className="text-accent-primary" />
						</div>
						<h2 class="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
							{$_('common.appName')}
						</h2>
					</div>

					<h2 class="text-3xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">
						{$_('auth.resetPassword')}
					</h2>
					<p class="text-light-text-secondary dark:text-dark-text-secondary mb-8">
						Zadejte své nové heslo.
					</p>

					<form
						bind:this={formElement}
						onsubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						class="space-y-5"
					>
						{#if generalError}
							<div
								class="p-4 bg-error/10 border border-error rounded-lg text-error text-sm flex items-start gap-2"
							>
								<Icon name="alert-circle" size={20} className="flex-shrink-0 mt-0.5" />
								<span>{generalError}</span>
							</div>
						{/if}

						<Input
							type="password"
							label={$_('auth.newPassword')}
							bind:value={password}
							error={passwordError}
							placeholder="••••••••"
							required
							autofocus
						/>

						<Input
							type="password"
							label={$_('auth.confirmNewPassword')}
							bind:value={confirmPassword}
							error={confirmPasswordError}
							placeholder="••••••••"
							required
						/>

						<div class="bg-light-card dark:bg-dark-card rounded-lg p-4">
							<div class="flex items-start gap-3">
								<Icon name="info" size={20} className="text-accent-primary mt-0.5 flex-shrink-0" />
								<div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
									<p class="font-medium mb-1">Požadavky na heslo:</p>
									<ul class="list-disc list-inside space-y-1 ml-2">
										<li>Alespoň 8 znaků</li>
										<li>Kombinace písmen a čísel doporučena</li>
									</ul>
								</div>
							</div>
						</div>

						<Button type="submit" variant="primary" fullWidth {loading}>
							{$_('auth.resetPassword')}
						</Button>
					</form>

					<div class="mt-6 text-center">
						<a
							href="/login"
							class="inline-flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors text-sm font-medium"
						>
							<Icon name="arrow-left" size={16} />
							{$_('auth.backToLogin')}
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.auth-brand {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
		overflow: hidden;
	}

	.auth-brand::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
		pointer-events: none;
	}
</style>
