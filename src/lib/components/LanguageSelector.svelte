<script lang="ts">
	import { locale } from 'svelte-i18n';

	let currentLocale = $state($locale || 'cs');

	const languages = [
		{ code: 'cs', name: 'Čeština' },
		{ code: 'en', name: 'English' }
	];

	function changeLanguage(code: string) {
		locale.set(code);
		currentLocale = code;
	}
</script>

<div class="relative inline-block">
	<select
		bind:value={currentLocale}
		onchange={(e) => changeLanguage(e.currentTarget.value)}
		class="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
	>
		{#each languages as lang}
			<option value={lang.code}>{lang.name}</option>
		{/each}
	</select>
</div>
