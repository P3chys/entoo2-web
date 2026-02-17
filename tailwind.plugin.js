/**
 * Entoo2 Custom Tailwind Plugin
 *
 * This plugin adds custom utilities and components to Tailwind CSS
 * Benefits:
 * - Better IDE autocomplete
 * - Centralized design system
 * - Type safety with IntelliSense
 */

import plugin from 'tailwindcss/plugin';

export default plugin(
	function ({ addUtilities, addComponents, theme }) {
		// ===== ADAPTIVE COLOR UTILITIES =====
		// These utilities handle light/dark mode switching automatically

		const adaptiveUtilities = {
			// Adaptive Backgrounds
			'.bg-adaptive-primary': {
				'@apply bg-light-bg-primary dark:bg-dark-bg-primary': {}
			},
			'.bg-adaptive-secondary': {
				'@apply bg-light-bg-secondary dark:bg-dark-bg-secondary': {}
			},
			'.bg-adaptive-tertiary': {
				'@apply bg-light-bg-tertiary dark:bg-dark-bg-tertiary': {}
			},
			'.bg-adaptive-hover': {
				'@apply bg-light-bg-hover dark:bg-dark-bg-hover': {}
			},

			// Adaptive Text Colors
			'.text-adaptive-primary': {
				'@apply text-light-text-primary dark:text-dark-text-primary': {}
			},
			'.text-adaptive-secondary': {
				'@apply text-light-text-secondary dark:text-dark-text-secondary': {}
			},
			'.text-adaptive-tertiary': {
				'@apply text-light-text-tertiary dark:text-dark-text-tertiary': {}
			},
			'.text-adaptive-inverse': {
				'@apply text-light-text-inverse dark:text-dark-text-inverse': {}
			},

			// Adaptive Borders
			'.border-adaptive': {
				'@apply border-light-border-primary dark:border-dark-border-primary': {}
			},
			'.border-adaptive-secondary': {
				'@apply border-light-border-secondary dark:border-dark-border-secondary': {}
			}
		};

		// ===== FLEX LAYOUT UTILITIES =====
		// Common flex patterns to reduce repetition

		const flexUtilities = {
			'.flex-center': {
				'@apply flex items-center justify-center': {}
			},
			'.flex-between': {
				'@apply flex items-center justify-between': {}
			},
			'.flex-start': {
				'@apply flex items-center justify-start': {}
			},
			'.flex-end': {
				'@apply flex items-center justify-end': {}
			},

			// Flex with common gaps
			'.flex-gap-1': {
				'@apply flex items-center gap-1': {}
			},
			'.flex-gap-2': {
				'@apply flex items-center gap-2': {}
			},
			'.flex-gap-3': {
				'@apply flex items-center gap-3': {}
			},
			'.flex-gap-4': {
				'@apply flex items-center gap-4': {}
			},
			'.flex-gap-6': {
				'@apply flex items-center gap-6': {}
			}
		};

		// ===== COMPONENT CLASSES =====

		const iconComponents = {
			'.icon-container': {
				'@apply rounded-full bg-accent-primary/10 p-2 flex-center': {}
			},
			'.icon-container-sm': {
				'@apply rounded-full bg-accent-primary/10 p-1.5 flex-center': {}
			},
			'.icon-container-lg': {
				'@apply rounded-full bg-accent-primary/10 p-3 flex-center': {}
			}
		};

		const badgeComponents = {
			'.badge': {
				'@apply px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1': {}
			},
			'.badge-sm': {
				'@apply px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1': {}
			},
			'.badge-primary': {
				'@apply badge bg-accent-primary/10 text-accent-primary': {}
			},
			'.badge-success': {
				'@apply badge bg-success/10 text-success': {}
			},
			'.badge-warning': {
				'@apply badge bg-warning/10 text-warning': {}
			},
			'.badge-error': {
				'@apply badge bg-error/10 text-error': {}
			},
			'.badge-info': {
				'@apply badge bg-info/10 text-info': {}
			}
		};

		const navComponents = {
			'.nav-link': {
				'@apply px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline flex-gap-2':
					{}
			},
			'.nav-link-active': {
				'@apply nav-link bg-accent-primary text-white': {}
			},
			'.nav-link-inactive': {
				'@apply nav-link text-adaptive-primary hover:bg-adaptive-hover': {}
			}
		};

		// Add all utilities and components
		addUtilities(adaptiveUtilities);
		addUtilities(flexUtilities);
		addComponents(iconComponents);
		addComponents(badgeComponents);
		addComponents(navComponents);
	},
	{
		// Plugin configuration
		theme: {
			// You can extend theme values here if needed
		}
	}
);
