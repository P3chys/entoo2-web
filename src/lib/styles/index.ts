/**
 * Styles - Central export
 *
 * Usage:
 *   import { s, cx } from '$styles';
 *   <div class={s.stack.md}>
 *   <h1 class={s.text.xl}>
 */

export { s, cx } from './tokens';

// Backward compat
export { spacing, text, layout, interactive } from './tokens';
