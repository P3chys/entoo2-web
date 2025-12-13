<script lang="ts">
	import { t } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { Document } from '$lib/types';
	import Button from './Button.svelte';

	interface Props {
		subjectId: string;
		onSuccess?: (document: Document) => void;
		onError?: (error: string) => void;
	}

	let { subjectId, onSuccess = () => {}, onError = () => {} }: Props = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let fileInput: HTMLInputElement;

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		dragging = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		dragging = false;
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		dragging = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			await uploadFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			await uploadFile(target.files[0]);
		}
	};

	const uploadFile = async (file: File) => {
		if (file.size > 50 * 1024 * 1024) {
			onError($t('documents.maxSize'));
			return;
		}

		uploading = true;
		const { data, error } = await api.upload<{ success: boolean; data: Document }>(`/api/v1/subjects/${subjectId}/documents`, file);
		uploading = false;

		if (error) {
			onError(error.message);
		} else if (data?.success && data.data) {
			onSuccess(data.data);
			// Reset input
			if (fileInput) fileInput.value = '';
		}
	};
</script>

<div
	class="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 {dragging
		? 'border-primary bg-primary/5'
		: 'border-base-300 hover:border-primary/50'}"
	ondragenter={handleDragEnter}
	ondragover={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label={$t('documents.upload')}
>
	<input
		type="file"
		class="hidden"
		bind:this={fileInput}
		onchange={handleFileSelect}
		accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.txt,.xlsx,.xls,.csv"
	/>

	<div class="flex flex-col items-center gap-4">
		<div class="p-4 bg-base-200 rounded-full text-primary">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-8 h-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
				/>
			</svg>
		</div>

		<div>
			<h3 class="text-lg font-semibold">
				{uploading ? $t('common.loading') : $t('documents.upload')}
			</h3>
			<p class="text-base-content/60 text-sm mt-1">
				{$t('documents.supportedFormats')}
			</p>
		</div>

		<!-- Pass onclick as a prop to Button, as Button.svelte uses $props() and expects onclick prop -->
		<Button
			variant="primary"
			size="sm"
			disabled={uploading}
			onclick={() => fileInput.click()}
		>
			{$t('common.upload')}
		</Button>
	</div>
</div>
