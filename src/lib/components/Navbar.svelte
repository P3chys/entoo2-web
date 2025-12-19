<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { authStore, isAdmin } from '$stores/auth';
	import ThemeToggle from './ThemeToggle.svelte';
    import Icon from './Icon.svelte';

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
		{ href: '/', label: $_('navigation.home'), icon: 'home' },
		...($isAdmin ? [{ href: '/semesters', label: $_('navigation.semesters'), icon: 'semesters' }] : []),
		{ href: '/subjects', label: $_('navigation.subjects'), icon: 'subjects' },
		{ href: '/favorites', label: $_('navigation.favorites'), icon: 'favorites' }
	]);
</script>

<!-- Skip Links for Accessibility -->
<a href="#main-content" class="skip-link">
	{$_('common.skip_to_content')}
</a>

<nav aria-label="Main navigation" class="bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border-primary dark:border-dark-border-primary shadow-sm">
	<div class="w-full px-4 sm:px-6 md:px-8">
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
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline flex items-center gap-2 {$page.url.pathname === item.href
								? 'bg-accent-primary text-white'
								: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
						>
                            <Icon name={item.icon} size={20} />
							{item.label}
						</a>
					{/each}
					<a
						href="/search"
						aria-label={$_('common.search')}
						class="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline {$page.url.pathname.startsWith('/search')
							? 'bg-accent-primary text-white'
							: 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'}"
					>
						<Icon name="search" size={20} />
					</a>
				</div>
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center gap-2">
				<div class="hidden md:flex items-center gap-2">
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
					<span class="sr-only">{$_('common.open_menu')}</span>
					{#if !mobileMenuOpen}
						<Icon name="menu" size={24} />
					{:else}
						<Icon name="close" size={24} />
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
