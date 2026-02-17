<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentUser, isAdmin } from '$stores/auth';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Activity } from '$types';
	import Icon from '$components/Icon.svelte';
	import Button from '$components/Button.svelte';
	import { SectionHeader, ListItem, ActivityItem, EmptyState } from '$components/ui';
	import { staggerFadeIn, slideInFrom } from '$lib/utils/animation';
	import { s, cx } from '$styles';

	const quickActions = $derived([
		...($isAdmin
			? [
					{
						href: '/semesters',
						icon: 'semesters',
						label: $_('navigation.semesters'),
						desc: $_('dashboard.quickActionSemesters')
					}
				]
			: []),
		{
			href: '/subjects',
			icon: 'subjects',
			label: $_('navigation.subjects'),
			desc: $_('dashboard.quickActionSubjects')
		},
		{
			href: '/favorites',
			icon: 'favorites',
			label: $_('navigation.favorites'),
			desc: $_('dashboard.quickActionFavorites')
		}
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
	let interval: ReturnType<typeof setInterval>;

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
		const activityRes = await api.get<{ success: boolean; data: Activity[] }>(
			'/api/v1/activities/recent?limit=10'
		);
		if (activityRes.data?.success) {
			recentActivity = (activityRes.data.data || []).map((a) => {
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
		interval = setInterval(loadData, 60000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class={s.stack.xl} in:fade={{ duration: 200 }}>
	<!-- Hero -->
	<div class="hero" use:slideInFrom={{ direction: 'top' }}>
		<div class="relative z-10">
			<h1 class={cx(s.text['2xl'], 'mb-2')}>
				{$_('common.welcome')}, {$currentUser?.email?.split('@')[0] || $_('common.student')}
			</h1>
			<p class={cx(s.text.body, 'opacity-90 mb-6')}>
				{$_('dashboard.subtitle')}
			</p>

			<!-- Search Bar -->
			<div class={s.container.sm}>
				<a href="/search" class="block group no-underline">
					<div
						class={cx(
							s.row.md,
							s.pad.md,
							'bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl border border-white/30 hover:border-white/50 hover:shadow-lg transition-all'
						)}
					>
						<Icon name="search" size={24} className="text-white" />
						<span class="text-white/80 group-hover:text-white"
							>{$_('dashboard.searchPlaceholder')}</span
						>
						<div class={cx('ml-auto', s.row.sm, 'px-3 py-1 bg-white/20 rounded-lg')}>
							<span class="text-white/70 text-sm">{$_('dashboard.keyboardShortcut')}</span>
						</div>
					</div>
				</a>
			</div>
		</div>
	</div>

	<!-- Two Columns -->
	<div class="grid grid-cols-1 lg:grid-cols-5 gap-8 px-2">
		<!-- Quick Actions -->
		<section class="lg:col-span-2" use:slideInFrom={{ direction: 'left', delay: 100 }}>
			<SectionHeader icon="zap">{$_('dashboard.quickActions')}</SectionHeader>
			<nav class={s.stack.sm} use:staggerFadeIn>
				{#each quickActions as action}
					<ListItem
						href={action.href}
						icon={action.icon}
						title={action.label}
						description={action.desc}
					/>
				{/each}
			</nav>
		</section>

		<!-- Recent Activity -->
		<section class="lg:col-span-3" use:slideInFrom={{ direction: 'right', delay: 100 }}>
			<SectionHeader icon="clock">{$_('dashboard.recentActivity')}</SectionHeader>

			{#if recentActivity.length > 0}
				<div class={s.stack.sm} use:staggerFadeIn>
					{#each recentActivity as activity (activity.id)}
						<ActivityItem
							href={activity.href}
							icon={activity.icon}
							title={activity.title}
							description={activity.description}
							time={activity.time}
						/>
					{/each}
				</div>
			{:else}
				<EmptyState
					icon="file-text"
					title={$_('dashboard.noActivity')}
					description={$_('dashboard.noActivityDesc')}
				>
					<Button href="/semesters">📅 {$_('navigation.semesters')}</Button>
					<Button href="/subjects" variant="ghost">📚 {$_('navigation.subjects')}</Button>
				</EmptyState>
			{/if}
		</section>
	</div>

	<!-- Study Tip -->
	<section class="px-2" use:slideInFrom={{ direction: 'bottom', delay: 200 }}>
		<div
			class={cx(
				s.pad.lg,
				'bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 dark:from-accent-primary/20 dark:to-accent-secondary/20 rounded-xl border border-accent-primary/20'
			)}
		>
			<div class={cx(s.row.lg, 'items-start')}>
				<div class="p-3 bg-accent-primary/10 rounded-lg shrink-0">
					<Icon name="award" size={28} className="text-accent-primary" />
				</div>
				<div>
					<h3 class={cx(s.text.md, 'mb-2')}>{$_('dashboard.studyTipTitle')}</h3>
					<p class={s.text.muted}>{$_('dashboard.studyTipText')}</p>
				</div>
			</div>
		</div>
	</section>
</div>
