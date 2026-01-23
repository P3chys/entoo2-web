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
	created_at: string;
	average_rating?: number;
	total_ratings?: number;
	user_rating?: number;
}

export interface Subject {
	id: string;
	semester_id: string;
	name_cs: string;
	code: string;
	description_cs: string;
	credits: number;
	created_at: string;
	updated_at: string;
	semester?: Semester;
	teachers?: SubjectTeacher[];
	is_favorite?: boolean;
}

export interface DocumentType {
	id: string;
	subject_id: string;
	name_cs: string;
	icon: string;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export interface DocumentCategory {
	id: string;
	subject_id: string;
	type_id: string;
	name_cs: string;
	order_index: number;
	created_by: string;
	created_at: string;
	updated_at: string;
	type?: DocumentType;
}

export interface Document {
	id: string;
	subject_id: string;
	uploaded_by: string;
	answer_id?: string;
	type_id: string;
	category_id?: string;
	filename: string;
	original_name: string;
	file_size: number;
	mime_type: string;
	minio_path: string;
	content_text?: string;
	created_at: string;
	subject?: Subject;
	uploader?: User;
	document_type?: DocumentType;
	category?: DocumentCategory;
	is_favorite?: boolean;
}

export interface CategoryWithDocuments {
	category: DocumentCategory;
	documents: Document[];
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
	code?: string;
	description_cs?: string;
	credits?: number;
	_formatted?: Record<string, string>;
	_matchesPosition?: any;
}

export interface SearchFilters {
	subject_id?: string;
	type?: 'all' | 'documents' | 'subjects';
	mime_type?: string;
	exact?: boolean;
	sort_by?: 'relevance' | 'date' | 'name' | 'size';
	doc_type?: 'lecture' | 'seminar' | 'other';
}

export interface SearchResponse {
	success: boolean;
	data: {
		documents?: MeilisearchHit[];
		subjects?: MeilisearchHit[];
		documents_count?: number;
		subjects_count?: number;
	};
	total?: number;
	query?: string;
	processingTimeMs?: number;
}

export interface FileTypeFilter {
	label: string;
	mimeType: string;
	icon: string;
}

export interface ApiError {
	error: string;
	message: string;
	status: number;
	code?: string;
}

export interface FlashcardDeck {
	id: string;
	subject_id: string;
	created_by: string;
	title: string;
	description: string;
	is_public: boolean;
	card_count: number;
	is_favorite: boolean;
	created_at: string;
	updated_at: string;
	creator?: User;
	subject?: Subject;
	flashcards?: Flashcard[];
}

export type CardType = 'standard' | 'multiple_choice';

export interface Flashcard {
	id: string;
	deck_id: string;
	card_type: CardType;
	front_text: string;
	back_text: string;
	options?: string; // JSON array of options for multiple choice
	correct_option?: number; // Index of correct option (0-based), -1 for standard cards
	order_index: number;
	created_at: string;
	updated_at: string;
	deck?: FlashcardDeck;
}

export interface UserFlashcardProgress {
	id: string;
	user_id: string;
	flashcard_id: string;
	deck_id: string;
	ease_factor: number;
	interval: number;
	repetitions: number;
	next_review_date: string | null;
	last_reviewed_at: string | null;
	total_reviews: number;
	correct_reviews: number;
	created_at: string;
	updated_at: string;
}

export interface FlashcardStudySession {
	id: string;
	user_id: string;
	deck_id: string;
	cards_studied: number;
	cards_correct: number;
	duration_seconds: number;
	started_at: string;
	completed_at: string | null;
	created_at: string;
}

export interface DeckProgress {
	total_cards: number;
	mastered_cards: number;
	learning_cards: number;
	new_cards: number;
	cards_due_today: number;
	average_ease_factor: number;
	total_study_time_seconds: number;
}

export interface StudyCardWithProgress extends Flashcard {
	progress?: UserFlashcardProgress;
}

// Dashboard Stats Types
export interface UserStats {
	total_users: number;
	registered_today: number;
	active_last_24h: number;
	active_last_15min: number;
	verified_users: number;
	admin_count: number;
}

export interface EndpointStats {
	endpoint: string;
	count: number;
}

export interface APIStats {
	total_requests: number;
	requests_today: number;
	top_endpoints: EndpointStats[];
	requests_by_hour: Record<string, number>;
}

export interface ActivityStats {
	total_activities: number;
	activities_today: number;
	by_type: Record<string, number>;
	recent_activities: Activity[];
}

export interface SystemStats {
	total_documents: number;
	documents_today: number;
	total_subjects: number;
	total_semesters: number;
	total_flashcard_decks: number;
	total_comments: number;
	total_questions: number;
}

export interface DashboardOverview {
	users: UserStats;
	api: APIStats;
	activity: ActivityStats;
	system: SystemStats;
}
