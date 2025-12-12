<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentUser } from '$stores/auth';
	import { fade } from 'svelte/transition';

	const stats = [
		{ label: $_('navigation.semesters'), value: '0', href: '/semesters', icon: '📅' },
		{ href: '/subjects', icon: '📚', label: $_('navigation.subjects'), value: '0' },
		{ label: $_('documents.title'), value: '0', href: '/subjects', icon: '📄' },
		{ label: $_('navigation.favorites'), value: '0', href: '/favorites', icon: '⭐' }
	];

	const quickActions = [
		{ href: '/semesters', icon: '📅', label: $_('navigation.semesters'), desc: 'Manage your academic terms' },
		{ href: '/subjects', icon: '📚', label: $_('navigation.subjects'), desc: 'Browse course materials' },
		{ href: '/favorites', icon: '⭐', label: $_('navigation.favorites'), desc: 'Quick access to saved items' }
	];

	const recentActivity = [];
</script>

<div class="space-y-10" in:fade={{ duration: 200 }}>
	<!-- Hero Section with inline stats -->
	<div class="hero">
		<div class="relative z-10">
			<h1 class="text-4xl md:text-5xl font-bold mb-2">
				{$_('common.welcome')}, {$currentUser?.email?.split('@')[0] || 'Student'}
			</h1>
			<p class="text-lg opacity-90 mb-8">
				Your study hub is ready. Here's your overview.
			</p>

			<!-- Stats as inline badges (NOT cards) -->
			<div class="flex flex-wrap items-center gap-3">
				{#each stats as stat}
					<a
						href={stat.href}
						class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all duration-200 no-underline hover:scale-105"
					>
						<span class="text-lg">{stat.icon}</span>
						<span class="font-bold">{stat.value}</span>
						<span class="text-sm opacity-80">{stat.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- Two column layout: Quick Actions + Recent Activity side by side -->
	<div class="grid grid-cols-1 lg:grid-cols-5 gap-8 px-2">
		<!-- Quick Actions (left column - narrower) -->
		<section class="lg:col-span-2">
			<h2 class="text-xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
				<svg class="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
				</svg>
				{$_('dashboard.quickActions')}
			</h2>
			
			<!-- List style, NOT card grid -->
			<nav class="space-y-1">
				{#each quickActions as action}
					<a
						href={action.href}
						class="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors no-underline border-l-4 border-transparent hover:border-accent-primary"
					>
						<span class="text-xl">{action.icon}</span>
						<div class="flex-1 min-w-0">
							<span class="block font-medium text-light-text-primary dark:text-dark-text-primary group-hover:text-accent-primary transition-colors">
								{action.label}
							</span>
							<span class="block text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
								{action.desc}
							</span>
						</div>
						<svg class="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
						</svg>
					</a>
				{/each}
			</nav>
		</section>

		<!-- Recent Activity (right column - wider) -->
		<section class="lg:col-span-3">
			<h2 class="text-xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
				<svg class="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				{$_('dashboard.recentActivity')}
			</h2>

			{#if recentActivity.length > 0}
				<div class="space-y-2">
					{#each recentActivity as activity}
						<div class="flex items-center gap-3 py-3 border-b border-light-border-secondary dark:border-dark-border-secondary last:border-0">
							<span class="text-xl">{activity.icon}</span>
							<div class="flex-1 min-w-0">
								<p class="font-medium text-light-text-primary dark:text-dark-text-primary truncate">{activity.title}</p>
								<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{activity.description}</p>
							</div>
							<span class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">{activity.time}</span>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Empty state - NO card wrapper, just centered content -->
				<div class="text-center py-12">
					<svg
						class="w-16 h-16 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-50"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>

					<h3 class="text-lg font-semibold mb-1 text-light-text-primary dark:text-dark-text-primary">
						{$_('dashboard.noActivity')}
					</h3>
					<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-sm mx-auto">
						{$_('dashboard.noActivityDesc')}
					</p>

					<div class="flex gap-3 justify-center">
						<a
							href="/semesters"
							class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-hover transition-colors no-underline"
						>
							<span>📅</span>
							{$_('navigation.semesters')}
						</a>
						<a
							href="/subjects"
							class="inline-flex items-center gap-2 px-5 py-2.5 text-light-text-primary dark:text-dark-text-primary font-medium hover:text-accent-primary transition-colors no-underline"
						>
							<span>📚</span>
							{$_('navigation.subjects')}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
							</svg>
						</a>
					</div>
				</div>
			{/if}
		</section>
	</div>
</div>
