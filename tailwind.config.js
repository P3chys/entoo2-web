/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Light mode colors
				light: {
					bg: {
						primary: '#ffffff',
						secondary: '#f6f8fa',
						tertiary: '#f0f3f6',
						hover: '#eaeef2'
					},
					text: {
						primary: '#1f2328',
						secondary: '#4d5761',
						tertiary: '#6e7781',
						inverse: '#ffffff'
					},
					border: {
						primary: '#d1d9e0',
						secondary: '#eaeef2'
					}
				},
				// Dark mode colors
				dark: {
					bg: {
						primary: '#000000',
						secondary: '#0a0a0a',
						tertiary: '#1a1a1a',
						hover: '#242424'
					},
					text: {
						primary: '#ffffff',
						secondary: '#d1d1d1',
						tertiary: '#a8a8a8',
						inverse: '#000000'
					},
					border: {
						primary: '#333333',
						secondary: '#1a1a1a'
					}
				},
				// Accent colors (same for both modes)
				accent: {
					primary: '#3b82f6',
					secondary: '#2563eb',
					hover: '#1d4ed8',
					light: '#60a5fa',
					lighter: '#93c5fd'
				},
				// Semantic colors
				success: '#22c55e',
				warning: '#f59e0b',
				error: '#ef4444',
				info: '#3b82f6'
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Helvetica Neue',
					'Arial',
					'sans-serif'
				],
				mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace']
			},
			animation: {
				'fade-in': 'fadeIn 0.2s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'scale-in': 'scaleIn 0.2s ease-out'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			}
		}
	},
	plugins: []
};
