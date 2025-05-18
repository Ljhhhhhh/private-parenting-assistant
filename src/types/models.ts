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

// 记录类型
export type RecordType = 'Sleep' | 'Feeding' | 'Diaper' | 'Note';

export interface CreateRecordDto {
  /** 儿童ID */
  childId: number;
  /** 记录类型 */
  recordType: RecordType;
  /** 记录时间戳 */
  recordTimestamp: string;
  /** 记录详情 */
  details: Record<string, any>;
}

export interface RecordResponseDto {
  /** 记录ID */
  id: number;
  /** 儿童ID */
  childId: number;
  /** 记录类型 */
  recordType: RecordType;
  /** 记录详情 */
  details: Record<string, any>;
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
  details?: Record<string, any>;
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
