<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import TextStyle from '@tiptap/extension-text-style';
	import { Color } from '@tiptap/extension-color';
	import Highlight from '@tiptap/extension-highlight';
	import Icon from './Icon.svelte';

	interface Props {
		content?: string;
		placeholder?: string;
		onUpdate?: (html: string) => void;
	}

	let { content = '', placeholder = '', onUpdate = () => {} }: Props = $props();

	let element: HTMLDivElement;
	let editor: Editor | null = $state(null);

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				}),
				Underline,
				TextStyle,
				Color,
				Highlight.configure({
					multicolor: true
				})
			],
			content: content,
			editorProps: {
				attributes: {
					class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4'
				}
			},
			onUpdate: ({ editor }) => {
				onUpdate(editor.getHTML());
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleUnderline() {
		editor?.chain().focus().toggleUnderline().run();
	}

	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}

	function setHeading(level: 1 | 2 | 3) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function setColor(color: string) {
		editor?.chain().focus().setColor(color).run();
	}

	function toggleHighlight(color: string) {
		editor?.chain().focus().toggleHighlight({ color }).run();
	}

	function clearFormatting() {
		editor?.chain().focus().unsetAllMarks().clearNodes().run();
	}

	const isActive = (name: string, attrs?: Record<string, unknown>) => {
		return editor?.isActive(name, attrs) ?? false;
	};
</script>

<div class="border border-base-300 rounded-lg overflow-hidden bg-base-100">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 p-2 border-b border-base-300 bg-base-200">
		<!-- Text formatting -->
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('bold') ? 'btn-active' : ''}"
			onclick={toggleBold}
			title="Bold"
		>
			<strong>B</strong>
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('italic') ? 'btn-active' : ''}"
			onclick={toggleItalic}
			title="Italic"
		>
			<em>I</em>
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('underline') ? 'btn-active' : ''}"
			onclick={toggleUnderline}
			title="Underline"
		>
			<u>U</u>
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('strike') ? 'btn-active' : ''}"
			onclick={toggleStrike}
			title="Strikethrough"
		>
			<s>S</s>
		</button>

		<div class="divider divider-horizontal mx-1 h-6"></div>

		<!-- Headings -->
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('heading', { level: 1 }) ? 'btn-active' : ''}"
			onclick={() => setHeading(1)}
			title="Heading 1"
		>
			H1
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('heading', { level: 2 }) ? 'btn-active' : ''}"
			onclick={() => setHeading(2)}
			title="Heading 2"
		>
			H2
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('heading', { level: 3 }) ? 'btn-active' : ''}"
			onclick={() => setHeading(3)}
			title="Heading 3"
		>
			H3
		</button>

		<div class="divider divider-horizontal mx-1 h-6"></div>

		<!-- Lists -->
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('bulletList') ? 'btn-active' : ''}"
			onclick={toggleBulletList}
			title="Bullet List"
		>
			<Icon name="list" size={14} />
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-xs {isActive('orderedList') ? 'btn-active' : ''}"
			onclick={toggleOrderedList}
			title="Numbered List"
		>
			1.
		</button>

		<div class="divider divider-horizontal mx-1 h-6"></div>

		<!-- Colors -->
		<div class="dropdown dropdown-hover">
			<div tabindex="0" role="button" class="btn btn-ghost btn-xs" title="Text Color">
				<span class="w-4 h-4 rounded border border-base-300" style="background: currentColor;"
				></span>
			</div>
			<div
				tabindex="0"
				class="dropdown-content z-50 bg-base-100 rounded-lg shadow-lg p-2 border border-base-300"
			>
				<div class="grid grid-cols-5 gap-1">
					{#each ['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#ffffff', '#374151'] as color}
						<button
							type="button"
							class="w-6 h-6 rounded border border-base-300"
							style="background-color: {color};"
							onclick={() => setColor(color)}
						></button>
					{/each}
				</div>
			</div>
		</div>

		<div class="dropdown dropdown-hover">
			<div tabindex="0" role="button" class="btn btn-ghost btn-xs" title="Highlight">
				<span class="w-4 h-4 rounded border border-base-300 bg-yellow-200"></span>
			</div>
			<div
				tabindex="0"
				class="dropdown-content z-50 bg-base-100 rounded-lg shadow-lg p-2 border border-base-300"
			>
				<div class="grid grid-cols-5 gap-1">
					{#each ['#FEF08A', '#BBF7D0', '#BFDBFE', '#DDD6FE', '#FBCFE8'] as color}
						<button
							type="button"
							class="w-6 h-6 rounded border border-base-300"
							style="background-color: {color};"
							onclick={() => toggleHighlight(color)}
						></button>
					{/each}
				</div>
			</div>
		</div>

		<div class="divider divider-horizontal mx-1 h-6"></div>

		<!-- Clear formatting -->
		<button
			type="button"
			class="btn btn-ghost btn-xs"
			onclick={clearFormatting}
			title="Clear Formatting"
		>
			<Icon name="x" size={14} />
		</button>
	</div>

	<!-- Editor content -->
	<div bind:this={element} class="min-h-[200px]"></div>
</div>

<style>
	:global(.ProseMirror) {
		min-height: 200px;
		padding: 1rem;
	}

	:global(.ProseMirror:focus) {
		outline: none;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #adb5bd;
		pointer-events: none;
		height: 0;
	}

	:global(.ProseMirror h1) {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror h2) {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror h3) {
		font-size: 1.1rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	:global(.ProseMirror ul),
	:global(.ProseMirror ol) {
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	:global(.ProseMirror ul) {
		list-style-type: disc;
	}

	:global(.ProseMirror ol) {
		list-style-type: decimal;
	}
</style>
