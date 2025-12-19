export interface User {
	id: string;
	email: string;
	role: 'student' | 'admin';
	created_at: string;
	updated_at: string;
}

export interface AuthResponse {
	user: User;
	access_token: string;
	refresh_token: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
}

export interface Semester {
	id: string;
	name_cs: string;
	name_en: string;
	order_index: number;
	created_at: string;
	updated_at: string;
	subjects?: Subject[];
}

export interface SubjectTeacher {
	id: string;
	subject_id: string;
	teacher_name: string;
	topic_cs: string;
	topic_en: string;
	created_at: string;
}

export interface Subject {
	id: string;
	semester_id: string;
	name_cs: string;
	name_en: string;
	code: string;
	description_cs: string;
	description_en: string;
	credits: number;
	created_at: string;
	updated_at: string;
	semester?: Semester;
	teachers?: SubjectTeacher[];
	is_favorite?: boolean;
}

export interface Document {
	id: string;
	subject_id: string;
	uploaded_by: string;
	answer_id?: string;
	category: 'lecture' | 'seminar' | 'other';
	filename: string;
	original_name: string;
	file_size: number;
	mime_type: string;
	minio_path: string;
	content_text?: string;
	created_at: string;
	subject?: Subject;
	uploader?: User;
	is_favorite?: boolean;
}

export interface Activity {
	id: string;
	user_id: string;
	activity_type: 'document_uploaded' | 'document_deleted';
	subject_id?: string;
	document_id?: string;
	metadata?: Record<string, any>;
	created_at: string;
	subject?: Subject;
	document?: Document;
	user?: User;
}

export interface Comment {
	id: string;
	subject_id: string;
	user_id: string;
	content: string;
	is_anonymous: boolean;
	created_at: string;
	updated_at: string;
	user?: User;
}

export interface Question {
	id: string;
	subject_id: string;
	user_id: string;
	content: string;
	is_anonymous: boolean;
	created_at: string;
	updated_at: string;
	user?: User;
	answers?: Answer[];
}

export interface Answer {
	id: string;
	question_id: string;
	user_id: string;
	content: string;
	document_id?: string;
	created_at: string;
	updated_at: string;
	user?: User;
	document?: Document;
}

export interface SearchResult {
	type: 'document' | 'subject' | 'comment';
	id: string;
	title: string;
	description: string;
	highlight?: string;
	score: number;
	subject_id?: string;
	subject_name?: string;
	mime_type?: string;
	file_size?: number;
	created_at?: string;
	code?: string;
	credits?: number;
}

export interface MeilisearchHit {
	id: string;
	subject_id?: string;
	original_name?: string;
	content_text?: string;
	filename?: string;
	mime_type?: string;
	file_size?: number;
	created_at?: string;
	name_cs?: string;
	name_en?: string;
	code?: string;
	description_cs?: string;
	description_en?: string;
	credits?: number;
	_formatted?: Record<string, string>;
	_matchesPosition?: any;
}

export interface SearchFilters {
	subject_id?: string;
	type?: 'all' | 'documents' | 'subjects';
	mime_type?: string;
}

export interface SearchResponse {
	success: boolean;
	data: MeilisearchHit[];
	total?: number;
	query?: string;
	processingTimeMs?: number;
}

export interface ApiError {
	error: string;
	message: string;
	status: number;
}
