<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentUser, isAdmin } from '$stores/auth';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Activity } from '$types';
	import Icon from '$components/Icon.svelte';
	import { staggerFadeIn, slideInFrom } from '$lib/utils/animation';

	const quickActions = $derived([
		...($isAdmin ? [{ href: '/semesters', icon: 'semesters', label: $_('navigation.semesters'), desc: $_('dashboard.quickActionSemesters') }] : []),
		{ href: '/subjects', icon: 'subjects', label: $_('navigation.subjects'), desc: $_('dashboard.quickActionSubjects') },
		{ href: '/favorites', icon: 'favorites', label: $_('navigation.favorites'), desc: $_('dashboard.quickActionFavorites') }
	]);

	interface ActivityDisplay {
		id: string;
		icon: string;
		title: string;
		description: string;
		time: string;
		href?: string;
	}

	let recentActivity: ActivityDisplay[] = $state([]);
	let interval: any;

	function formatTimeAgo(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	async function loadData() {
		// Fetch activities
		const activityRes = await api.get<{success: boolean, data: Activity[]}>('/api/v1/activities/recent?limit=10');
		if (activityRes.data?.success) {
			recentActivity = (activityRes.data.data || []).map(a => {
				const isUpload = a.activity_type === 'document_uploaded';
				const userName = a.user?.email || $_('common.unknown_user');
				const subjectName = a.subject?.name_cs || $_('common.unknown_subject');
				const docName = a.document?.original_name || 'document';
				
				return {
					id: a.id,
					icon: isUpload ? 'upload' : 'delete',
					title: isUpload ? `${userName} uploaded "${docName}"` : `${userName} deleted a document`,
					description: `in ${subjectName}`,
					time: formatTimeAgo(a.created_at),
					href: a.subject_id ? `/subjects/${a.subject_id}` : undefined
				};
			});
		}
	}

	onMount(() => {
		loadData();
		// Refresh specific data periodically if needed
		interval = setInterval(loadData, 60000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class="space-y-10" in:fade={{ duration: 200 }}>
	<!-- Hero Section -->
	<div class="hero" use:slideInFrom={{ direction: 'top' }}>
		<div class="relative z-10">
			<h1 class="text-4xl md:text-5xl font-bold mb-2">
				{$_('common.welcome')}, {$currentUser?.email?.split('@')[0] || $_('common.student')}
			</h1>
			<p class="text-lg opacity-90 mb-6">
				{$_('dashboard.subtitle')}
			</p>

			<!-- Quick Search Bar -->
			<div class="max-w-2xl">
				<a href="/search" class="block group no-underline">
					<div class="flex items-center gap-3 px-5 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50 hover:shadow-lg">
						<Icon name="search" size={24} className="text-white" />
						<span class="text-white/80 group-hover:text-white text-base">{$_('dashboard.searchPlaceholder')}</span>
						<div class="ml-auto flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg">
							<span class="text-white/70 text-sm">{$_('dashboard.keyboardShortcut')}</span>
						</div>
					</div>
				</a>
			</div>
		</div>
	</div>

	<!-- Two column layout: Quick Actions + Recent Activity side by side -->
	<div class="grid grid-cols-1 lg:grid-cols-5 gap-8 px-2">
		<!-- Quick Actions (left column - narrower) -->
		<section class="lg:col-span-2" use:slideInFrom={{ direction: 'left', delay: 100 }}>
			<h2 class="text-xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
				<Icon name="zap" size={20} className="text-accent-primary" />
				{$_('dashboard.quickActions')}
			</h2>

			<!-- List style, NOT card grid -->
			<nav class="space-y-2" use:staggerFadeIn>
				{#each quickActions as action}
					<a
						href={action.href}
						class="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all no-underline border-l-4 border-transparent hover:border-accent-primary hover:shadow-md"
					>
						<Icon name={action.icon} size={24} className="text-accent-primary" />
						<div class="flex-1 min-w-0">
							<span class="block font-medium text-light-text-primary dark:text-dark-text-primary group-hover:text-accent-primary transition-colors">
								{action.label}
							</span>
							<span class="block text-sm text-light-text-tertiary dark:text-dark-text-tertiary truncate">
								{action.desc}
							</span>
						</div>
						<Icon name="chevron-right" size={16} className="text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
					</a>
				{/each}
			</nav>
		</section>

		<!-- Recent Activity (right column - wider) -->
		<section class="lg:col-span-3" use:slideInFrom={{ direction: 'right', delay: 100 }}>
			<h2 class="text-xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
				<Icon name="clock" size={20} className="text-accent-primary" />
				{$_('dashboard.recentActivity')}
			</h2>

			{#if recentActivity.length > 0}
				<div class="space-y-2" use:staggerFadeIn>
					{#each recentActivity as activity (activity.id)}
						{#if activity.href}
							<a href={activity.href} class="block no-underline">
								<div class="flex items-center gap-3 py-3 border-b border-light-border-secondary dark:border-dark-border-secondary last:border-0 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all px-3 -mx-3 rounded-lg hover:shadow-sm">
									<div class="p-2 rounded-lg bg-accent-primary/10">
										<Icon name={activity.icon} size={20} className="text-accent-primary" />
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-medium text-light-text-primary dark:text-dark-text-primary truncate">{activity.title}</p>
										<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{activity.description}</p>
									</div>
									<span class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">{activity.time}</span>
								</div>
							</a>
						{:else}
							<div class="flex items-center gap-3 py-3 border-b border-light-border-secondary dark:border-dark-border-secondary last:border-0 px-3 -mx-3">
								<div class="p-2 rounded-lg bg-accent-primary/10">
									<Icon name={activity.icon} size={20} className="text-accent-primary" />
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-light-text-primary dark:text-dark-text-primary truncate">{activity.title}</p>
									<p class="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{activity.description}</p>
								</div>
								<span class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">{activity.time}</span>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<!-- Empty state by default or loading... -->
				<!-- Reuse previous empty state -->
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

	<!-- Study Tips Section -->
	<section class="px-2" use:slideInFrom={{ direction: 'bottom', delay: 200 }}>
		<div class="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 dark:from-accent-primary/20 dark:to-accent-secondary/20 rounded-xl p-6 border border-accent-primary/20">
			<div class="flex items-start gap-4">
				<div class="p-3 bg-accent-primary/10 rounded-lg flex-shrink-0">
					<Icon name="award" size={28} className="text-accent-primary" />
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
						{$_('dashboard.studyTipTitle')}
					</h3>
					<p class="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
						{$_('dashboard.studyTipText')}
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
