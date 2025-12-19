<script lang="ts">
	import { t } from 'svelte-i18n';
	import { api } from '$lib/utils/api';
	import type { Document } from '$lib/types';
	import Button from './Button.svelte';
    import Icon from './Icon.svelte';

	interface Props {
		subjectId: string;
		onSuccess?: (document: Document) => void;
		onError?: (error: string) => void;
	}

	let { subjectId, onSuccess = () => {}, onError = () => {} }: Props = $props();

	let dragging = $state(false);
	let uploading = $state(false);
	let category = $state<'lecture' | 'seminar' | 'other'>('lecture');
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
		const { data, error } = await api.upload<{ success: boolean; data: Document }>(
			`/api/v1/subjects/${subjectId}/documents`,
			file,
			{ category }
		);
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
            <Icon name="upload" size={32} />
		</div>

		<div>
			<h3 class="text-lg font-semibold">
				{uploading ? $t('common.loading') : $t('documents.upload')}
			</h3>
			<p class="text-base-content/60 text-sm mt-1">
				{$t('documents.supportedFormats')}
			</p>
		</div>

		<!-- Category selector -->
		<div class="w-full max-w-xs">
			<label class="block text-sm font-medium mb-2">
				{$t('documents.category')}
			</label>
			<select
				bind:value={category}
				class="select select-bordered w-full"
				disabled={uploading}
			>
				<option value="lecture">{$t('documents.categoryLecture')}</option>
				<option value="seminar">{$t('documents.categorySeminar')}</option>
				<option value="other">{$t('documents.categoryOther')}</option>
			</select>
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
