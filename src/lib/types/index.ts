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
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	created_at: string;
	updated_at: string;
}

export interface Subject {
	id: string;
	semester_id: string;
	name: string;
	code: string;
	description: string;
	credits: number;
	created_at: string;
	updated_at: string;
	semester?: Semester;
}

export interface Document {
	id: string;
	subject_id: string;
	user_id: string;
	name: string;
	description: string;
	file_path: string;
	file_size: number;
	mime_type: string;
	created_at: string;
	updated_at: string;
	subject?: Subject;
	user?: User;
}

export interface Comment {
	id: string;
	subject_id: string;
	user_id: string;
	content: string;
	created_at: string;
	updated_at: string;
	user?: User;
}

export interface Question {
	id: string;
	subject_id: string;
	user_id: string;
	title: string;
	content: string;
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
	created_at: string;
	updated_at: string;
	user?: User;
}

export interface SearchResult {
	type: 'document' | 'subject' | 'comment';
	id: string;
	title: string;
	description: string;
	highlight?: string;
	score: number;
}

export interface ApiError {
	error: string;
	message: string;
	status: number;
}
