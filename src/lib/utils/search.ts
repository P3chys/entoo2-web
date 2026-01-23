import type { MeilisearchHit, SearchResult, FileTypeFilter } from '$types';

export function transformMeilisearchHit(hit: MeilisearchHit): SearchResult {
	const isDocument = hit.mime_type !== undefined;

	return {
		type: isDocument ? 'document' : 'subject',
		id: hit.id,
		title: isDocument
			? hit._formatted?.original_name || hit.original_name || 'Unnamed Document'
			: hit._formatted?.name_cs || hit.name_cs || 'Unnamed Subject',
		description: isDocument
			? extractDescription(hit)
			: hit._formatted?.description_cs || hit.description_cs || '',
		score: 0,
		subject_id: hit.subject_id,
		mime_type: hit.mime_type,
		file_size: hit.file_size,
		created_at: hit.created_at,
		code: hit._formatted?.code || hit.code,
		credits: hit.credits,
		highlight: extractHighlight(hit)
	};
}

export function extractDescription(hit: MeilisearchHit): string {
	// Prefer formatted content_text with highlights
	if (hit._formatted?.content_text) {
		return hit._formatted.content_text.substring(0, 300);
	}
	// Fallback to raw content_text
	if (hit.content_text) {
		return hit.content_text.substring(0, 300);
	}
	return 'No description';
}

export function extractHighlight(hit: MeilisearchHit): string | undefined {
	// Check for highlighted content in formatted results
	if (hit._formatted?.content_text && hit._formatted.content_text.includes('<mark>')) {
		return hit._formatted.content_text;
	}
	if (hit._formatted?.original_name && hit._formatted.original_name.includes('<mark>')) {
		return hit._formatted.original_name;
	}
	if (hit._formatted?.name_cs && hit._formatted.name_cs.includes('<mark>')) {
		return hit._formatted.name_cs;
	}
	if (hit._formatted?.description_cs && hit._formatted.description_cs.includes('<mark>')) {
		return hit._formatted.description_cs;
	}
	return undefined;
}

export function highlightText(text: string, query: string): string {
	if (!query.trim()) return escapeHtml(text);

	const escaped = escapeHtml(text);
	const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
	return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatFileSize(bytes?: number): string {
	if (!bytes) return '';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return function (...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export const FILE_TYPE_FILTERS: FileTypeFilter[] = [
	{ label: 'All Files', mimeType: '', icon: '📎' },
	{ label: 'PDF', mimeType: 'application/pdf', icon: '📄' },
	{ label: 'Word', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝' },
	{ label: 'PowerPoint', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', icon: '📽️' },
	{ label: 'Excel', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: '📊' },
	{ label: 'Images', mimeType: 'image/', icon: '🖼️' },
	{ label: 'Text', mimeType: 'text/', icon: '📃' }
];

export function getFileTypeIcon(mimeType?: string): string {
	if (!mimeType) return '📎';
	if (mimeType.includes('pdf')) return '📄';
	if (mimeType.includes('word')) return '📝';
	if (mimeType.includes('sheet')) return '📊';
	if (mimeType.includes('presentation')) return '📽️';
	if (mimeType.startsWith('image/')) return '🖼️';
	if (mimeType.startsWith('text/')) return '📃';
	return '📎';
}

export function getFileTypeName(mimeType?: string): string {
	if (!mimeType) return 'Unknown';
	if (mimeType.includes('pdf')) return 'PDF';
	if (mimeType.includes('word')) return 'Word Document';
	if (mimeType.includes('sheet')) return 'Excel Spreadsheet';
	if (mimeType.includes('presentation')) return 'PowerPoint';
	if (mimeType.startsWith('image/')) return 'Image';
	if (mimeType.startsWith('text/')) return 'Text File';
	return 'Document';
}
