<script lang="ts">
	import { locale, _ } from 'svelte-i18n';

	let currentLocale = $derived($locale || 'en');

	const languages = [
		{ code: 'cs', name: 'Čeština' },
		{ code: 'en', name: 'English' }
	];

	function changeLanguage(code: string) {
		locale.set(code);
		// Persist language selection
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('locale', code);
		}
	}
</script>

<div class="relative inline-block">
	<select
		value={currentLocale}
		onchange={(e) => changeLanguage(e.currentTarget.value)}
		aria-label={$_('language.select') || 'Select language'}
		class="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-all"
	>
		{#each languages as lang}
			<option value={lang.code}>{lang.name}</option>
		{/each}
	</select>
</div>
