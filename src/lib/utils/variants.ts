/**
 * Component Variants using class-variance-authority
 *
 * This file defines all component variants for consistent styling
 * Benefits:
 * - Type-safe variant props
 * - No more ternary class strings
 * - Composable variants
 * - Better IntelliSense
 */

import { cva, type VariantProps } from 'class-variance-authority';

// ===== BUTTON VARIANTS =====

export const buttonVariants = cva(
	// Base styles
	'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
	{
		variants: {
			variant: {
				primary: 'bg-accent-primary text-white hover:bg-accent-hover active:scale-95',
				secondary:
					'bg-adaptive-tertiary text-adaptive-primary hover:bg-adaptive-hover active:scale-95',
				ghost: 'bg-transparent hover:bg-adaptive-hover text-adaptive-primary active:scale-95',
				danger: 'bg-error text-white hover:bg-error/90 active:scale-95',
				outline:
					'border-2 border-adaptive bg-transparent text-adaptive-primary hover:bg-adaptive-hover active:scale-95'
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2 text-base',
				lg: 'px-6 py-3 text-lg'
			},
			fullWidth: {
				true: 'w-full',
				false: 'w-auto'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
			fullWidth: false
		}
	}
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// ===== CARD VARIANTS =====

export const cardVariants = cva(
	// Base styles
	'bg-adaptive-secondary border border-adaptive rounded-lg p-6 shadow-sm transition-all duration-200',
	{
		variants: {
			variant: {
				default: '',
				interactive:
					'hover:shadow-md hover:border-accent-primary/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
				outlined: 'border-2',
				elevated: 'shadow-md hover:shadow-lg'
			},
			padding: {
				none: 'p-0',
				sm: 'p-3',
				md: 'p-6',
				lg: 'p-8'
			}
		},
		defaultVariants: {
			variant: 'default',
			padding: 'md'
		}
	}
);

export type CardVariants = VariantProps<typeof cardVariants>;

// ===== INPUT VARIANTS =====

export const inputVariants = cva(
	// Base styles
	'w-full px-4 py-2 rounded-lg border bg-adaptive-primary text-adaptive-primary border-adaptive focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-all duration-200',
	{
		variants: {
			variant: {
				default: '',
				error: 'border-error focus-visible:ring-error',
				success: 'border-success focus-visible:ring-success'
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2 text-base',
				lg: 'px-5 py-3 text-lg'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type InputVariants = VariantProps<typeof inputVariants>;

// ===== LINK VARIANTS =====

export const linkVariants = cva(
	// Base styles
	'transition-colors',
	{
		variants: {
			variant: {
				default: 'text-accent-primary hover:text-accent-hover hover:underline',
				subtle: 'text-adaptive-secondary hover:text-adaptive-primary',
				nav: 'text-adaptive-primary hover:bg-adaptive-hover px-3 py-2 rounded-lg no-underline',
				navActive: 'bg-accent-primary text-white px-3 py-2 rounded-lg no-underline'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	}
);

export type LinkVariants = VariantProps<typeof linkVariants>;

// ===== ALERT/TOAST VARIANTS =====

export const alertVariants = cva(
	// Base styles
	'rounded-lg p-4 border-l-4 flex-gap-3',
	{
		variants: {
			variant: {
				info: 'bg-info/10 border-l-info text-adaptive-primary',
				success: 'bg-success/10 border-l-success text-adaptive-primary',
				warning: 'bg-warning/10 border-l-warning text-adaptive-primary',
				error: 'bg-error/10 border-l-error text-adaptive-primary'
			}
		},
		defaultVariants: {
			variant: 'info'
		}
	}
);

export type AlertVariants = VariantProps<typeof alertVariants>;

// ===== CONTAINER VARIANTS =====

export const containerVariants = cva(
	// Base styles
	'mx-auto px-4',
	{
		variants: {
			size: {
				sm: 'max-w-2xl',
				md: 'max-w-4xl',
				lg: 'max-w-6xl',
				xl: 'max-w-7xl',
				full: 'max-w-full'
			},
			centered: {
				true: 'flex flex-col items-center',
				false: ''
			}
		},
		defaultVariants: {
			size: 'lg',
			centered: false
		}
	}
);

export type ContainerVariants = VariantProps<typeof containerVariants>;
