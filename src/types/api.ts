// Common response interfaces
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

// Auth interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

// User interfaces
export interface UserPublic {
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
  id: string;
}

export interface UserCreate {
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string;
}

export interface UserUpdate {
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string;
  password?: string;
}

export interface UserUpdateMe {
  full_name?: string;
  email?: string;
}

export interface UserRegister {
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdatePassword {
  current_password: string;
  new_password: string;
}

export interface NewPassword {
  token: string;
  new_password: string;
}

export type UsersPublic = PaginatedResponse<UserPublic>;

// Child interfaces
export interface ChildPublic {
  name: string;
  birthday: string; // ISO date format
  gender: string;
  id: string;
  parent_id: string;
  created_at: string; // ISO datetime format
  updated_at: string; // ISO datetime format
}

export interface ChildCreate {
  name: string;
  birthday: string; // ISO date format
  gender: string;
}

export interface ChildUpdate {
  name?: string;
  birthday?: string; // ISO date format
  gender?: string;
}

export type ChildrenPublic = PaginatedResponse<ChildPublic>;

// Growth record interfaces
export interface GrowthRecordPublic {
  record_type: string;
  record_data: Record<string, any>;
  recorded_at: string; // ISO datetime format
  notes?: string;
  id: string;
  child_id: string;
  created_at: string; // ISO datetime format
  attachments?: string[];
}

export interface GrowthRecordCreate {
  record_type: string;
  record_data: Record<string, any>;
  recorded_at: string; // ISO datetime format
  notes?: string;
  child_id: string;
}

export interface GrowthRecordUpdate {
  record_type?: string;
  record_data?: Record<string, any>;
  recorded_at?: string; // ISO datetime format
  notes?: string;
}

export type GrowthRecordsPublic = PaginatedResponse<GrowthRecordPublic>;

// Child detail interfaces
export interface ChildDetailPublic {
  detail_type: string;
  content: string;
  tags: string[];
  importance: number;
  id: string;
  child_id: string;
  created_at: string; // ISO datetime format
  updated_at: string; // ISO datetime format
  recorded_at: string; // ISO datetime format
}

export interface ChildDetailCreate {
  detail_type: string;
  content: string;
  tags?: string[];
  importance?: number;
  child_id: string;
  recorded_at?: string; // ISO datetime format
}

export interface ChildDetailUpdate {
  detail_type?: string;
  content?: string;
  tags?: string[];
  importance?: number;
}

export type ChildDetailsPublic = PaginatedResponse<ChildDetailPublic>;

// Document interfaces
export interface DocumentPublic {
  title: string;
  description?: string;
  file_type: string;
  status: string;
  id: string;
  filename: string;
  upload_timestamp: string; // ISO datetime format
  doc_metadata?: Record<string, any>;
}

export interface DocumentUpdate {
  title?: string;
  description?: string;
  status?: string;
}

export type DocumentsPublic = PaginatedResponse<DocumentPublic>;

// Chat interfaces
export interface ChatHistoryPublic {
  session_id: string;
  user_query: string;
  ai_response: string;
  model: string;
  id: string;
  user_id: string;
  child_id?: string;
  created_at: string; // ISO datetime format
  sources?: string[];
}

export interface ChatRequest {
  question: string;
  session_id?: string;
  child_id?: string;
  model?: string;
}

export type ChatHistoriesPublic = PaginatedResponse<ChatHistoryPublic>;

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

// Item interfaces (example resource)
export interface ItemPublic {
  title: string;
  description?: string;
  id: string;
  owner_id: string;
}

export interface ItemCreate {
  title: string;
  description?: string;
}

export interface ItemUpdate {
  title?: string;
  description?: string;
}

export type ItemsPublic = PaginatedResponse<ItemPublic>;
