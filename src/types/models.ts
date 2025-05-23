/**
 * 育儿助手API类型定义
 * 根据API文档自动生成
 */

// 认证相关类型
export interface RegisterDto {
  /** 用户的邮箱地址 */
  email: string;
  /** 用户密码，长度至少8位，包含大小写字母和数字 */
  password: string;
  /** 邮箱验证码，6位数字 */
  verificationCode: string;
}

export interface LoginDto {
  /** 用户的邮箱地址 */
  email: string;
  /** 用户密码 */
  password: string;
}

export interface TokenDto {
  /** JWT Access Token */
  accessToken: string;
  /** JWT Refresh Token */
  refreshToken: string;
}

export interface SendVerificationCodeDto {
  /** 用户的邮箱地址 */
  email: string;
}

export interface ResetPasswordDto {
  /** 用户的邮箱地址 */
  email: string;
  /** 新密码，长度至少8位，包含大小写字母和数字 */
  newPassword: string;
  /** 邮箱验证码，6位数字 */
  verificationCode: string;
}

// 儿童相关类型
export interface CreateChildDto {
  /** 孩子昵称 */
  nickname: string;
  /** 出生日期 */
  dateOfBirth: string;
  /** 性别 (可选) */
  gender?: string;
  /** 过敏信息列表 (字符串数组) */
  allergyInfo?: string[];
  /** 更多信息 (可选) */
  moreInfo?: string;
}

export interface ChildResponseDto {
  /** 儿童的唯一标识符 */
  id: number;
  /** 儿童昵称 */
  nickname: string;
  /** 出生日期 (YYYY-MM-DD) */
  dateOfBirth: string;
  /** 性别 */
  gender?: string;
  /** 过敏信息列表 (字符串数组) */
  allergyInfo?: string[];
  /** 其他信息 */
  moreInfo?: string;
  /** 记录创建时间 */
  createdAt: string;
  /** 记录更新时间 */
  updatedAt: string;
}

export interface UpdateChildDto {
  /** 孩子昵称 */
  nickname?: string;
  /** 出生日期 */
  dateOfBirth?: string;
  /** 性别 (可选) */
  gender?: string;
  /** 过敏信息列表 (字符串数组) */
  allergyInfo?: string[];
  /** 更多信息 (可选) */
  moreInfo?: string;
}

// 记录类型枚举
export enum RecordType {
  SLEEP = 'Sleep',
  FEEDING = 'Feeding',
  DIAPER = 'Diaper',
  GROWTH = 'Growth',
  NOTE = 'Note',
}

// 喂食类型枚举
export enum FeedingType {
  MILK = 'milk',
  COMPLEMENTARY = 'complementary',
  MEAL = 'meal',
}

// 睡眠记录详情
export interface SleepDetails {
  sleepDuration: string;
  quality?: number;
  environment?: string;
  notes?: string;
}

// 喂食记录详情
export interface FeedingDetails {
  feedingType: FeedingType;
  amount: number;
  unit?: 'ml' | 'g';
  reaction?: string;
  notes?: string;
}

// 尿布记录详情
export interface DiaperDetails {
  hasUrine: boolean;
  hasStool: boolean;
  stoolColor?: string;
  stoolConsistency?: string;
  rashStatus?: string;
  notes?: string;
}

// 笔记记录详情
export interface NoteDetails {
  content: string;
  tags?: string[];
}

// 成长趋势记录详情
export interface GrowthDetails {
  height?: number;
  weight?: number;
  headCircumference?: number;
  notes?: string;
}

// 记录详情联合类型
type RecordDetails =
  | SleepDetails
  | FeedingDetails
  | DiaperDetails
  | NoteDetails
  | GrowthDetails;

export interface CreateRecordDto {
  /** 儿童ID */
  childId: number;
  /** 记录类型 */
  recordType: RecordType;
  /** 记录时间戳 */
  recordTimestamp: string;
  /** 记录详情 */
  details: RecordDetails;
}

export interface RecordResponseDto {
  /** 记录ID */
  id: number;
  /** 儿童ID */
  childId: number;
  /** 记录类型 */
  recordType: RecordType;
  /** 记录详情 */
  details: RecordDetails;
  /** 记录时间戳 */
  recordTimestamp: string;
  /** 记录创建时间 */
  createdAt: string;
}

export interface UpdateRecordDto {
  /** 儿童ID */
  childId?: number;
  /** 记录类型 */
  recordType?: RecordType;
  /** 记录时间戳 */
  recordTimestamp?: string;
  /** 记录详情 */
  details?: Partial<RecordDetails>;
}

// 聊天相关类型
export interface ChatRequestDto {
  /** 用户消息 */
  message: string;
  /** 关联的孩子ID（可选） */
  childId?: number;
}

export interface ChatResponseDto {
  /** AI回复内容 */
  response: string;
  /** 聊天记录ID */
  chatId: number;
}

export interface ChatFeedbackDto {
  /** 聊天历史ID */
  chatHistoryId: number;
  /** 反馈（true为有用，false为无用） */
  isHelpful: boolean;
}

export type ChatStreamResponseType = 'content' | 'done' | 'error';

export interface ChatStreamResponseDto {
  /** 消息类型 */
  type: ChatStreamResponseType;
  /** AI回复内容片段 */
  content?: string;
  /** 聊天记录ID，仅在type为done时返回 */
  chatId?: number;
  /** 错误信息，仅在type为error时返回 */
  error?: string;
}

// 会话管理相关类型
export interface CreateConversationDto {
  /** 会话标题（可选，如果不提供则使用初始消息自动生成） */
  title?: string;
  /** 关联的孩子ID（可选） */
  childId?: number;
  /** 首条消息（可选） */
  initialMessage?: string;
}

export interface UpdateConversationDto {
  /** 新的会话标题（可选） */
  title?: string;
  /** 是否归档（可选） */
  isArchived?: boolean;
}

export interface ConversationResponseDto {
  /** 会话ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 关联的孩子ID（可选） */
  childId?: number;
  /** 会话标题 */
  title?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 是否归档 */
  isArchived: boolean;
  /** 消息数量 */
  messageCount: number;
  /** 最新一条消息（可选） */
  latestMessage?: ChatHistoryDto;
}

export interface ConversationDetailDto extends ConversationResponseDto {
  /** 消息列表 */
  messages: ChatHistoryDto[];
}

export interface ConversationMessageDto {
  /** 用户消息 */
  message: string;
}

// 聊天历史相关类型
export interface ChatHistoryDto {
  /** 聊天历史ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 关联的儿童ID */
  childId?: number;
  /** 关联的会话ID（可选） */
  conversationId?: number;
  /** 用户消息 */
  userMessage: string;
  /** AI回复 */
  aiResponse?: string;
  /** 上下文摘要 */
  contextSummary: string[];
  /** 反馈状态 */
  feedback?: number;
  /** 是否有用反馈 */
  isHelpful?: boolean;
  /** 请求时间 */
  requestTimestamp: string;
  /** 回复时间 */
  responseTimestamp?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

export interface ChatHistoryListDto {
  /** 聊天历史列表 */
  data: ChatHistoryDto[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
}

// UI显示用的消息类型
export interface ChatMessage {
  /** 消息ID */
  id: string;
  /** 消息内容 */
  content: string;
  /** 是否为用户消息 */
  isUser: boolean;
  /** 时间戳 */
  timestamp: Date;
  /** 反馈状态 */
  feedback?: 'helpful' | 'not-helpful';
  /** 关联的聊天历史ID（用于API调用） */
  chatHistoryId?: number;
  /** 关联的会话ID（可选） */
  conversationId?: number;
}

// 会话查询参数
export interface ConversationQueryParams {
  /** 筛选特定孩子的会话（可选） */
  childId?: number;
  /** 是否包含已归档会话，默认为false（可选） */
  includeArchived?: boolean;
  /** 返回的最大记录数，默认为10（可选） */
  limit?: number;
  /** 分页偏移量，默认为0（可选） */
  offset?: number;
}

// 消息查询参数
export interface MessageQueryParams {
  /** 返回的最大记录数，默认为20（可选） */
  limit?: number;
  /** 分页偏移量，默认为0（可选） */
  offset?: number;
}

// 聊天历史查询参数
export interface ChatHistoryQueryParams {
  /** 儿童ID */
  childId: number;
  /** 限制数量，默认为10 */
  limit?: number;
  /** 偏移量，默认为0 */
  offset?: number;
}

// 问题建议查询参数
export interface SuggestionsQueryParams {
  /** 儿童ID */
  childId: number;
}

// 标准API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 向量数据库相关类型
export interface CreateTextChunkDto {
  /** 文本内容 */
  content: string;
  /** 来源类型，如 child_profile, record, chat_history 等 */
  sourceType: string;
  /** 来源ID */
  sourceId: number;
  /** 儿童ID */
  childId: number;
  /** 元数据，如时间戳、记录类型等 */
  metadata?: Record<string, any>;
}

export interface CreateTextChunksDto {
  /** 文本块数组 */
  chunks: CreateTextChunkDto[];
}

export interface TextChunkFilterDto {
  /** 来源类型数组 */
  sourceTypes?: string[];
  /** 开始日期 */
  fromDate?: string;
  /** 结束日期 */
  toDate?: string;
  /** 元数据过滤条件 */
  metadataFilters?: Record<string, any>;
}

export interface SearchTextChunkDto {
  /** 查询文本 */
  queryText: string;
  /** 儿童ID */
  childId: number;
  /** 返回结果数量限制 */
  limit?: number;
  /** 相似度阈值 (0-1) */
  threshold?: number;
  /** 过滤条件 */
  filters?: TextChunkFilterDto;
}

export interface TextChunkResponseDto {
  /** 文本块ID */
  id: string;
  /** 文本内容 */
  content: string;
  /** 来源类型 */
  sourceType: string;
  /** 来源ID */
  sourceId: number;
  /** 儿童ID */
  childId: number;
  /** 元数据 */
  metadata: Record<string, any>;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 相似度分数 (0-1) */
  similarity?: number;
}

export interface UpdateTextChunkDto {
  /** 新的文本内容 */
  content: string;
  /** 新的元数据 */
  metadata?: Record<string, any>;
}

// 添加LoginResponseDto接口
export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
