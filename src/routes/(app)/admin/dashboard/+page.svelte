<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { isAdmin, currentUser } from '$stores/auth';
	import { api } from '$lib/utils/api';
	import type { DashboardOverview, Activity } from '$types';
	import Icon from '$components/Icon.svelte';
	import { SectionHeader, ActivityItem } from '$components/ui';
	import { s, cx } from '$styles';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let stats = $state<DashboardOverview | null>(null);
	let lastUpdated = $state<Date | null>(null);
	let refreshInterval: ReturnType<typeof setInterval>;

	async function loadStats() {
		loading = true;
		error = null;

		const res = await api.get<{ success: boolean; data: DashboardOverview }>('/api/v1/admin/stats/overview');

		if (res.error || !res.data?.success) {
			error = res.error?.message || 'Failed to load stats';
			loading = false;
			return;
		}

		stats = res.data.data;
		lastUpdated = new Date();
		loading = false;
	}

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

	function getActivityIcon(type: string): string {
		switch (type) {
			case 'document_uploaded':
				return 'upload';
			case 'document_deleted':
				return 'trash';
			case 'flashcard_deck_created':
				return 'layers';
			case 'flashcard_study_completed':
				return 'check-circle';
			default:
				return 'zap';
		}
	}

	function formatActivityTitle(activity: Activity): string {
		const userName = activity.user?.email?.split('@')[0] || 'Unknown';
		switch (activity.activity_type) {
			case 'document_uploaded':
				return `${userName} uploaded a document`;
			case 'document_deleted':
				return `${userName} deleted a document`;
			case 'flashcard_deck_created':
				return `${userName} created a flashcard deck`;
			case 'flashcard_study_completed':
				return `${userName} completed a study session`;
			default:
				return `${userName} performed an action`;
		}
	}

	onMount(() => {
		// Redirect non-admins
		if (!$isAdmin) {
			goto('/');
			return;
		}

		loadStats();
		// Auto-refresh every 30 seconds
		refreshInterval = setInterval(loadStats, 30000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});

	// Calculate percentage of total for activity types
	function getActivityPercentage(count: number, total: number): number {
		if (total === 0) return 0;
		return Math.round((count / total) * 100);
	}
</script>

<svelte:head>
	<title>{$_('admin.dashboard.title')} | Entoo2</title>
</svelte:head>

{#if !$isAdmin}
	<div class={cx(s.center, 'min-h-[50vh]')}>
		<div class={cx(s.stack.md, 'text-center')}>
			<Icon name="lock" size={48} className="text-adaptive-tertiary mx-auto" />
			<p class={s.text.muted}>Access denied</p>
		</div>
	</div>
{:else}
	<div class={s.stack.xl} in:fade={{ duration: 200 }}>
		<!-- Header -->
		<div class={s.between}>
			<div>
				<h1 class={s.text['2xl']}>{$_('admin.dashboard.title')}</h1>
				{#if lastUpdated}
					<p class={s.text.muted}>
						{$_('admin.dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
					</p>
				{/if}
			</div>
			<button
				onclick={loadStats}
				disabled={loading}
				class={cx(
					s.row.sm,
					s.pad.sm,
					'rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-50 transition-colors'
				)}
			>
				<Icon name="refresh" size={18} className={loading ? 'animate-spin' : ''} />
				{$_('admin.dashboard.refreshData')}
			</button>
		</div>

		{#if loading && !stats}
			<div class={cx(s.center, 'min-h-[40vh]')}>
				<div class={s.stack.md}>
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
					<p class={s.text.muted}>{$_('admin.dashboard.loading')}</p>
				</div>
			</div>
		{:else if error}
			<div class={cx(s.pad.lg, s.card, 'text-center')}>
				<Icon name="alert-circle" size={48} className="text-red-500 mx-auto mb-4" />
				<p class={s.text.body}>{$_('admin.dashboard.error')}</p>
				<p class={s.text.muted}>{error}</p>
			</div>
		{:else if stats}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Users Card -->
				<div class={cx(s.card, s.pad.lg)}>
					<div class={s.row.md}>
						<div class="p-3 bg-blue-500/10 rounded-lg">
							<Icon name="users" size={24} className="text-blue-500" />
						</div>
						<div>
							<p class={s.text.muted}>{$_('admin.dashboard.totalUsers')}</p>
							<p class="text-2xl font-bold text-adaptive-primary">{stats.users.total_users}</p>
						</div>
					</div>
					<div class={cx(s.row.lg, 'mt-4 pt-4 border-t border-adaptive')}>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.registeredToday')}</p>
							<p class="font-semibold text-green-500">+{stats.users.registered_today}</p>
						</div>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.activeNow')}</p>
							<p class="font-semibold text-accent-primary">{stats.users.active_last_15min}</p>
						</div>
					</div>
				</div>

				<!-- Documents Card -->
				<div class={cx(s.card, s.pad.lg)}>
					<div class={s.row.md}>
						<div class="p-3 bg-green-500/10 rounded-lg">
							<Icon name="file-text" size={24} className="text-green-500" />
						</div>
						<div>
							<p class={s.text.muted}>{$_('admin.dashboard.totalDocuments')}</p>
							<p class="text-2xl font-bold text-adaptive-primary">{stats.system.total_documents}</p>
						</div>
					</div>
					<div class={cx(s.row.lg, 'mt-4 pt-4 border-t border-adaptive')}>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.documentsToday')}</p>
							<p class="font-semibold text-green-500">+{stats.system.documents_today}</p>
						</div>
					</div>
				</div>

				<!-- Subjects Card -->
				<div class={cx(s.card, s.pad.lg)}>
					<div class={s.row.md}>
						<div class="p-3 bg-purple-500/10 rounded-lg">
							<Icon name="book-open" size={24} className="text-purple-500" />
						</div>
						<div>
							<p class={s.text.muted}>{$_('admin.dashboard.totalSubjects')}</p>
							<p class="text-2xl font-bold text-adaptive-primary">{stats.system.total_subjects}</p>
						</div>
					</div>
					<div class={cx(s.row.lg, 'mt-4 pt-4 border-t border-adaptive')}>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.semesters')}</p>
							<p class="font-semibold text-adaptive-primary">{stats.system.total_semesters}</p>
						</div>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.flashcardDecks')}</p>
							<p class="font-semibold text-adaptive-primary">{stats.system.total_flashcard_decks}</p>
						</div>
					</div>
				</div>

				<!-- API Usage Card -->
				<div class={cx(s.card, s.pad.lg)}>
					<div class={s.row.md}>
						<div class="p-3 bg-orange-500/10 rounded-lg">
							<Icon name="trending" size={24} className="text-orange-500" />
						</div>
						<div>
							<p class={s.text.muted}>{$_('admin.dashboard.apiUsage')}</p>
							<p class="text-2xl font-bold text-adaptive-primary">{stats.api.total_requests.toLocaleString()}</p>
						</div>
					</div>
					<div class={cx(s.row.lg, 'mt-4 pt-4 border-t border-adaptive')}>
						<div>
							<p class={s.text.hint}>{$_('admin.dashboard.requestsToday')}</p>
							<p class="font-semibold text-orange-500">{stats.api.requests_today.toLocaleString()}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Two Column Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- API Endpoints -->
				<div class={cx(s.card, s.pad.lg)}>
					<SectionHeader icon="bar-chart">{$_('admin.dashboard.topEndpoints')}</SectionHeader>
					{#if stats.api.top_endpoints.length > 0}
						<div class={s.stack.sm}>
							{#each stats.api.top_endpoints as endpoint}
								<div class={cx(s.between, s.pad.sm, 'bg-adaptive-tertiary/30 rounded-lg')}>
									<code class="text-sm text-adaptive-primary truncate flex-1 mr-4">{endpoint.endpoint}</code>
									<span class="text-sm font-medium text-accent-primary whitespace-nowrap">
										{endpoint.count.toLocaleString()} {$_('admin.dashboard.requests')}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class={cx(s.text.muted, 'text-center py-8')}>{$_('admin.dashboard.noData')}</p>
					{/if}
				</div>

				<!-- Hourly Requests Chart -->
				<div class={cx(s.card, s.pad.lg)}>
					<SectionHeader icon="clock">{$_('admin.dashboard.requestsByHour')}</SectionHeader>
					{#if Object.keys(stats.api.requests_by_hour).length > 0}
						{@const maxHourly = Math.max(...Object.values(stats.api.requests_by_hour), 1)}
						<div class="flex flex-col">
							<div class="h-40 flex items-end gap-0.5">
								{#each Array(24) as _, hour}
									{@const hourKey = `${hour.toString().padStart(2, '0')}:00`}
									{@const count = stats.api.requests_by_hour[hourKey] || 0}
									{@const heightPx = Math.max((count / maxHourly) * 160, count > 0 ? 4 : 1)}
									<div
										class="flex-1 bg-accent-primary/80 hover:bg-accent-primary rounded-t transition-all cursor-pointer"
										style="height: {heightPx}px"
										title="{hourKey}: {count} requests"
									></div>
								{/each}
							</div>
							<div class="flex gap-0.5 mt-1">
								{#each Array(24) as _, hour}
									<div class="flex-1 text-center">
										{#if hour % 4 === 0}
											<span class="text-[10px] text-adaptive-tertiary">{hour}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<p class={cx(s.text.muted, 'text-center py-8')}>{$_('admin.dashboard.noData')}</p>
					{/if}
				</div>
			</div>

			<!-- Activity Section -->
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Activity by Type -->
				<div class={cx(s.card, s.pad.lg)}>
					<SectionHeader icon="pie-chart">{$_('admin.dashboard.activityByType')}</SectionHeader>
					{#if Object.keys(stats.activity.by_type).length > 0}
						<div class={s.stack.md}>
							{#each Object.entries(stats.activity.by_type) as [type, count]}
								{@const percentage = getActivityPercentage(count, stats.activity.total_activities)}
								<div class={s.stack.xs}>
									<div class={s.between}>
										<span class={s.text.body}>{type.replace(/_/g, ' ')}</span>
										<span class={s.text.muted}>{count}</span>
									</div>
									<div class="h-2 bg-adaptive-tertiary/30 rounded-full overflow-hidden">
										<div
											class="h-full bg-accent-primary transition-all"
											style="width: {percentage}%"
										></div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class={cx(s.text.muted, 'text-center py-8')}>{$_('admin.dashboard.noData')}</p>
					{/if}
				</div>

				<!-- Recent Activity -->
				<div class={cx(s.card, s.pad.lg, 'lg:col-span-2')}>
					<SectionHeader icon="clock">{$_('admin.dashboard.recentActivity')}</SectionHeader>
					{#if stats.activity.recent_activities.length > 0}
						<div class={cx(s.stack.sm, 'max-h-80 overflow-y-auto')}>
							{#each stats.activity.recent_activities.slice(0, 10) as activity}
								<ActivityItem
									href={activity.subject_id ? `/subjects/${activity.subject_id}` : undefined}
									icon={getActivityIcon(activity.activity_type)}
									title={formatActivityTitle(activity)}
									description={activity.subject?.name_cs || ''}
									time={formatTimeAgo(activity.created_at)}
								/>
							{/each}
						</div>
					{:else}
						<p class={cx(s.text.muted, 'text-center py-8')}>{$_('admin.dashboard.noData')}</p>
					{/if}
				</div>
			</div>

			<!-- Additional Stats Row -->
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div class={cx(s.card, s.pad.md, 'text-center')}>
					<Icon name="message" size={24} className="text-blue-500 mx-auto mb-2" />
					<p class="text-2xl font-bold text-adaptive-primary">{stats.system.total_comments}</p>
					<p class={s.text.hint}>{$_('admin.dashboard.comments')}</p>
				</div>
				<div class={cx(s.card, s.pad.md, 'text-center')}>
					<Icon name="help-circle" size={24} className="text-purple-500 mx-auto mb-2" />
					<p class="text-2xl font-bold text-adaptive-primary">{stats.system.total_questions}</p>
					<p class={s.text.hint}>{$_('admin.dashboard.questions')}</p>
				</div>
				<div class={cx(s.card, s.pad.md, 'text-center')}>
					<Icon name="check-circle" size={24} className="text-green-500 mx-auto mb-2" />
					<p class="text-2xl font-bold text-adaptive-primary">{stats.users.verified_users}</p>
					<p class={s.text.hint}>{$_('admin.dashboard.verifiedUsers')}</p>
				</div>
				<div class={cx(s.card, s.pad.md, 'text-center')}>
					<Icon name="user" size={24} className="text-orange-500 mx-auto mb-2" />
					<p class="text-2xl font-bold text-adaptive-primary">{stats.users.admin_count}</p>
					<p class={s.text.hint}>{$_('admin.dashboard.adminCount')}</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
