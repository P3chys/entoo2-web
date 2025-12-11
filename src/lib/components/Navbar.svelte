<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { authStore, currentUser, isAdmin } from '$stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSelector from './LanguageSelector.svelte';

	function logout() {
		authStore.logout();
		window.location.href = '/login';
	}

	const navItems = $derived([
		{ href: '/', label: $_('navigation.home') },
		{ href: '/semesters', label: $_('navigation.semesters') },
		{ href: '/subjects', label: $_('navigation.subjects') },
		{ href: '/favorites', label: $_('navigation.favorites') }
	]);
</script>

<nav class="bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border-primary dark:border-dark-border-primary">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="text-2xl font-bold text-accent-primary no-underline">
					{$_('common.appName')}
				</a>
			</div>

			<!-- Navigation Links -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					{#each navItems as item}
						<a
							href={item.href}
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline {$page.url.pathname === item.href
								? 'bg-accent-primary text-white'
								: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
						>
							{item.label}
						</a>
					{/each}
					{#if $isAdmin}
						<a
							href="/admin"
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline {$page.url.pathname.startsWith('/admin')
								? 'bg-accent-primary text-white'
								: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
						>
							{$_('navigation.admin')}
						</a>
					{/if}
				</div>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center gap-2">
				<LanguageSelector />
				<ThemeToggle />
				<div class="ml-3 relative">
					<button
						onclick={logout}
						class="px-4 py-2 text-sm font-medium rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
					>
						{$_('common.logout')}
					</button>
				</div>
			</div>
		</div>
	</div>
</nav>
