<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { authStore, isAdmin } from '$stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSelector from './LanguageSelector.svelte';

	let mobileMenuOpen = $state(false);

	function logout() {
		authStore.logout();
		window.location.href = '/login';
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	const navItems = $derived([
		{ href: '/', label: $_('navigation.home') },
		{ href: '/semesters', label: $_('navigation.semesters') },
		{ href: '/subjects', label: $_('navigation.subjects') },
		{ href: '/favorites', label: $_('navigation.favorites') }
	]);
</script>

<!-- Skip Links for Accessibility -->
<a href="#main-content" class="skip-link">
	Skip to main content
</a>

<nav aria-label="Main navigation" class="bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border-primary dark:border-dark-border-primary">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="text-2xl font-bold text-accent-primary no-underline">
					{$_('common.appName')}
				</a>
			</div>

			<!-- Desktop Navigation Links -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					{#each navItems as item}
						<a
							href={item.href}
							aria-current={$page.url.pathname === item.href ? 'page' : undefined}
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
							aria-current={$page.url.pathname.startsWith('/admin') ? 'page' : undefined}
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline {$page.url.pathname.startsWith('/admin')
								? 'bg-accent-primary text-white'
								: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
						>
							{$_('navigation.admin')}
						</a>
					{/if}
					<a
						href="/search"
						aria-label={$_('common.search')}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline {$page.url.pathname.startsWith('/search')
							? 'bg-accent-primary text-white'
							: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
						</svg>
					</a>
				</div>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center gap-2">
				<div class="hidden md:flex items-center gap-2">
					<LanguageSelector />
					<ThemeToggle />
				</div>
				<div class="hidden md:block ml-3">
					<button
						onclick={logout}
						class="px-4 py-2 text-sm font-medium rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
					>
						{$_('common.logout')}
					</button>
				</div>

				<!-- Mobile menu button -->
				<button
					type="button"
					class="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
					aria-controls="mobile-menu"
					aria-expanded={mobileMenuOpen}
					aria-label="Toggle navigation menu"
					onclick={toggleMobileMenu}
				>
					<span class="sr-only">Open main menu</span>
					{#if !mobileMenuOpen}
						<!-- Hamburger icon -->
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{:else}
						<!-- Close icon -->
						<svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden" id="mobile-menu">
			<div class="px-2 pt-2 pb-3 space-y-1 border-t border-light-border-primary dark:border-dark-border-primary">
				{#each navItems as item}
					<a
						href={item.href}
						aria-current={$page.url.pathname === item.href ? 'page' : undefined}
						onclick={closeMobileMenu}
						class="block px-3 py-2 rounded-lg text-base font-medium no-underline {$page.url.pathname === item.href
							? 'bg-accent-primary text-white'
							: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
					>
						{item.label}
					</a>
				{/each}
				{#if $isAdmin}
					<a
						href="/admin"
						aria-current={$page.url.pathname.startsWith('/admin') ? 'page' : undefined}
						onclick={closeMobileMenu}
						class="block px-3 py-2 rounded-lg text-base font-medium no-underline {$page.url.pathname.startsWith('/admin')
							? 'bg-accent-primary text-white'
							: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
					>
						{$_('navigation.admin')}
					</a>
				{/if}
				<a
					href="/search"
					onclick={closeMobileMenu}
					class="block px-3 py-2 rounded-lg text-base font-medium no-underline {$page.url.pathname.startsWith('/search')
						? 'bg-accent-primary text-white'
						: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
				>
					{$_('common.search')}
				</a>

				<!-- Mobile settings -->
				<div class="pt-4 pb-3 border-t border-light-border-primary dark:border-dark-border-primary">
					<div class="flex items-center justify-around px-5">
						<LanguageSelector />
						<ThemeToggle />
					</div>
					<div class="mt-3 px-2">
						<button
							onclick={logout}
							class="w-full text-left px-3 py-2 rounded-lg text-base font-medium bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
						>
							{$_('common.logout')}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</nav>
