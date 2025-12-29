<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import Input from '$components/Input.svelte';
	import { fade } from 'svelte/transition';
	import { slideInFrom, fadeSlideIn } from '$lib/utils/animation';

	let resending = $state(false);
	let email = $state('');
	let error = $state('');
	let successMessage = $state('');
	let justRegistered = $state($page.url.searchParams.get('registered') === 'true');

	async function resendVerification() {
		if (!email) return;

		resending = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch('/api/v1/auth/verify-email/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();
			resending = false;

			if (data.success) {
				successMessage = $_('auth.verificationEmailSent');
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
				<Icon name="mail" size={32} className="text-accent-primary" />
			</div>

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
						<p class="mb-2">{$_('auth.didntReceiveEmail')}</p>
						<ul class="list-disc list-inside space-y-1 ml-2">
							<li>{$_('auth.checkSpam')}</li>
							<li>{$_('auth.checkEmailCorrect')}</li>
							<li>{$_('auth.waitFewMinutes')}</li>
						</ul>
					</div>
				</div>

				{#if successMessage}
					<div class="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
						{successMessage}
					</div>
				{/if}

				{#if error}
					<div class="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
						{error}
					</div>
				{/if}

				<div class="pt-4 border-t border-light-border dark:border-dark-border">
					<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
						{$_('auth.didntReceiveEmailShort')}
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
		</div>
	</div>
</div>
