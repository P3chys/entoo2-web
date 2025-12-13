import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';

addMessages('en', en);
addMessages('cs', cs);

// Get locale from localStorage or browser, fallback to Czech
const getInitialLocale = (): string => {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('locale');
		if (stored && (stored === 'en' || stored === 'cs')) {
			return stored;
		}
	}

	const browserLocale = getLocaleFromNavigator();
	// If browser locale starts with 'cs', use Czech, otherwise use English
	if (browserLocale?.startsWith('cs')) {
		return 'cs';
	}
	return 'en';
};

init({
	fallbackLocale: 'en',
	initialLocale: getInitialLocale()
});
