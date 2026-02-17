/**
 * Design Tokens - Simplified
 *
 * Usage: import { s } from '$styles';
 *
 * s.stack.md  → vertical stack with gap
 * s.row.md   → horizontal row with gap
 * s.text.lg  → large text
 * s.pad.md   → medium padding
 */

// Helper to combine classes
export function cx(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(' ');
}

export const s = {
	// === STACKS (vertical) ===
	stack: {
		xs: 'flex flex-col gap-1',
		sm: 'flex flex-col gap-2',
		md: 'flex flex-col gap-4',
		lg: 'flex flex-col gap-6',
		xl: 'flex flex-col gap-8'
	},

	// === ROWS (horizontal) ===
	row: {
		xs: 'flex items-center gap-1',
		sm: 'flex items-center gap-2',
		md: 'flex items-center gap-3',
		lg: 'flex items-center gap-4',
		xl: 'flex items-center gap-6'
	},

	// === PADDING ===
	pad: {
		xs: 'p-2',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6',
		xl: 'p-8'
	},

	// === TEXT ===
	text: {
		// Headings
		'2xl': 'text-3xl md:text-4xl font-bold text-adaptive-primary',
		xl: 'text-2xl md:text-3xl font-bold text-adaptive-primary',
		lg: 'text-xl font-semibold text-adaptive-primary',
		md: 'text-lg font-semibold text-adaptive-primary',
		sm: 'text-base font-medium text-adaptive-primary',
		// Body
		body: 'text-base text-adaptive-primary',
		// Muted
		muted: 'text-sm text-adaptive-secondary',
		hint: 'text-xs text-adaptive-tertiary'
	},

	// === SURFACES ===
	card: 'bg-adaptive-secondary border border-adaptive rounded-lg',
	cardHover:
		'bg-adaptive-secondary border border-adaptive rounded-lg hover:border-accent-primary/30 hover:shadow-md transition-all cursor-pointer',

	// === COMMON PATTERNS ===
	center: 'flex items-center justify-center',
	between: 'flex items-center justify-between',

	// === GRID ===
	grid: {
		2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
		3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
		4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
	},

	// === CONTAINER ===
	container: {
		sm: 'max-w-2xl mx-auto',
		md: 'max-w-4xl mx-auto',
		lg: 'max-w-6xl mx-auto'
	},

	// === INTERACTIVE ===
	hover: 'hover:bg-adaptive-hover transition-colors',
	clickable: 'cursor-pointer hover:bg-adaptive-hover active:scale-[0.98] transition-all',
	focus: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
} as const;

// Backward compatibility exports
export const spacing = { card: s.pad, gap: s.stack, section: s.pad };
export const text = {
	heading: s.text,
	body: { md: s.text.body },
	muted: { sm: s.text.muted, md: s.text.muted },
	hint: { sm: s.text.hint, xs: s.text.hint, md: s.text.hint }
};
export const layout = {
	stack: s.stack,
	inline: s.row,
	flex: { center: s.center, start: 'flex items-center justify-start' },
	grid: { cols: s.grid },
	container: s.container
};
export const interactive = { hover: { subtle: s.hover } };
