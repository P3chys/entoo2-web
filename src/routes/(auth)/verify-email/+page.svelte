<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import Input from '$components/Input.svelte';
	import { fade } from 'svelte/transition';
	import { slideInFrom, fadeSlideIn } from '$lib/utils/animation';

	let token = $state($page.url.searchParams.get('token') || '');
	let verifying = $state(false);
	let success = $state(false);
	let error = $state('');
	let resending = $state(false);
	let email = $state('');
	let justRegistered = $state($page.url.searchParams.get('registered') === 'true');

	onMount(async () => {
		if (token) {
			await verifyEmail();
		}
	});

	async function verifyEmail() {
		verifying = true;
		error = '';

		try {
			const response = await fetch(`/api/v1/auth/verify-email/${token}`);
			const data = await response.json();

			verifying = false;

			if (data.success) {
				success = true;
				// Redirect to login after 3 seconds
				setTimeout(() => goto('/login'), 3000);
			} else {
				error = data.error?.message || $_('auth.verificationFailed');
			}
		} catch (err) {
			verifying = false;
			error = $_('auth.verificationFailed');
		}
	}

	async function resendVerification() {
		if (!email) return;

		resending = true;
		error = '';

		try {
			const response = await fetch('/api/v1/auth/verify-email/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();
			resending = false;

			if (data.success) {
				justRegistered = true;
				email = '';
			} else {
				error = data.error?.message || $_('auth.verificationFailed');
			}
		} catch (err) {
			resending = false;
			error = $_('auth.verificationFailed');
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-6 bg-light-bg dark:bg-dark-bg" in:fade={{ duration: 200 }}>
	<div class="max-w-md w-full" use:slideInFrom={{ direction: 'bottom' }}>
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-accent-primary/10 rounded-full" use:fadeSlideIn>
				{#if verifying}
					<Icon name="loader" size={32} className="text-accent-primary animate-spin" />
				{:else if success}
					<Icon name="check-circle" size={32} className="text-success" />
				{:else if error}
					<Icon name="alert-circle" size={32} className="text-error" />
				{:else}
					<Icon name="mail" size={32} className="text-accent-primary" />
				{/if}
			</div>

			{#if verifying}
				<h2 class="text-2xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary" use:fadeSlideIn={{ delay: 100 }}>
					{$_('auth.verifying')}
				</h2>
				<p class="text-light-text-secondary dark:text-dark-text-secondary" use:fadeSlideIn={{ delay: 200 }}>
					{$_('auth.checkYourEmailMessage')}
				</p>
			{:else if success}
				<h2 class="text-2xl font-bold mb-2 text-success" use:fadeSlideIn>
					{$_('auth.verificationSuccess')}
				</h2>
				<p class="text-light-text-secondary dark:text-dark-text-secondary" use:fadeSlideIn={{ delay: 100 }}>
					{$_('auth.verificationSuccessMessage')}
				</p>
			{:else if error}
				<h2 class="text-2xl font-bold mb-2 text-error" use:fadeSlideIn>
					{$_('auth.verificationFailed')}
				</h2>
				<p class="text-error mb-6" use:fadeSlideIn={{ delay: 100 }}>{error}</p>

				<!-- Resend form -->
				<div class="bg-light-card dark:bg-dark-card rounded-lg p-6 space-y-4 text-left" use:fadeSlideIn={{ delay: 200 }}>
					<h3 class="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
						{$_('auth.resendVerification')}
					</h3>

					<Input
						type="email"
						bind:value={email}
						placeholder={$_('auth.email')}
						label={$_('auth.email')}
						required
					/>

					<Button onclick={resendVerification} loading={resending} variant="primary" fullWidth>
						{$_('auth.resendEmail')}
					</Button>

					<div class="text-center mt-4">
						<a href="/login" class="text-accent-primary hover:text-accent-secondary transition-colors text-sm">
							{$_('auth.backToLogin')}
						</a>
					</div>
				</div>
			{:else if justRegistered}
				<h2 class="text-2xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary" use:fadeSlideIn>
					{$_('auth.checkYourEmail')}
				</h2>
				<p class="text-light-text-secondary dark:text-dark-text-secondary mb-6" use:fadeSlideIn={{ delay: 100 }}>
					{$_('auth.checkYourEmailMessage')}
				</p>

				<div class="bg-light-card dark:bg-dark-card rounded-lg p-6 space-y-4" use:fadeSlideIn={{ delay: 200 }}>
					<div class="flex items-start gap-3 text-left">
						<Icon name="info" size={20} className="text-accent-primary mt-0.5 flex-shrink-0" />
						<div class="text-sm text-light-text-secondary dark:text-dark-text-secondary">
							<p class="mb-2">Pokud jste e-mail neobdrželi:</p>
							<ul class="list-disc list-inside space-y-1 ml-2">
								<li>Zkontrolujte spam/nevyžádanou poštu</li>
								<li>Ujistěte se, že jste zadali správný e-mail</li>
								<li>Počkejte několik minut a zkuste to znovu</li>
							</ul>
						</div>
					</div>

					<div class="pt-4 border-t border-light-border dark:border-dark-border">
						<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
							Neobdrželi jste e-mail?
						</p>

						<Input
							type="email"
							bind:value={email}
							placeholder={$_('auth.email')}
							label={$_('auth.email')}
							required
						/>

						<Button onclick={resendVerification} loading={resending} variant="secondary" fullWidth className="mt-3">
							{$_('auth.resendEmail')}
						</Button>
					</div>

					<div class="text-center mt-4">
						<a href="/login" class="text-accent-primary hover:text-accent-secondary transition-colors text-sm">
							{$_('auth.backToLogin')}
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
