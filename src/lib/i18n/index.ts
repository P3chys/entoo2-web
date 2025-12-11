import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';

addMessages('en', en);
addMessages('cs', cs);

init({
	fallbackLocale: 'cs',
	initialLocale: getLocaleFromNavigator()
});
