import { addMessages, init } from 'svelte-i18n';
import cs from './locales/cs.json';

addMessages('cs', cs);

init({
	fallbackLocale: 'cs',
	initialLocale: 'cs'
});
