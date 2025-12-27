export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString();
}

export function getFileIcon(mimeType: string): string {
	if (mimeType.includes('pdf')) return '📄';
	if (mimeType.includes('word')) return '📝';
	if (mimeType.includes('sheet') || mimeType.includes('csv')) return '📊';
	if (mimeType.includes('presentation')) return '📽️';
	if (mimeType.includes('image')) return '🖼️';
	if (mimeType.includes('text')) return '📃';
	return '📎';
}
