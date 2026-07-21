/**
 * Type definitions for Cloudflare Workers AI environment
 * Ensures proper typing for all AI model bindings and services
 */

export interface Env {
  // ── Workers AI Binding ────────────────────────────────────────────────
  AI: Ai;

  // ── KV Namespace Binding (for caching) ────────────────────────────────
  CACHE: KVNamespace;

  // ── D1 Database (optional - for blog history) ───────────────────────
  // DB?: D1Database;

  // ── Environment Variables ─────────────────────────────────────────────
  ENVIRONMENT?: 'production' | 'development';
}

/**
 * AI Instance for Cloudflare Workers AI
 * Provides access to various ML models via @cf namespace
 */
export interface Ai {
  run(
    model: string,
    options: {
      messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      prompt?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      top_k?: number;
      num_steps?: number;
      [key: string]: any;
    }
  ): Promise<AiResponse>;
}

/**
 * Response from AI model execution
 */
export interface AiResponse {
  response?: string;
  success?: boolean;
  error?: string;
  result?: any;
  [key: string]: any;
}

/**
 * KV Namespace for distributed caching
 */
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: KVPutOptions): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: KVListOptions): Promise<KVListResult>;
}

export interface KVPutOptions {
  expirationTtl?: number; // Time to live in seconds
  metadata?: Record<string, any>;
}

export interface KVListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface KVListResult {
  keys: Array<{ name: string; metadata?: any }>;
  list_complete: boolean;
  cursor?: string;
}

/**
 * Blog generation payload
 */
export interface BlogGenerationPayload {
  niche: string;
  keywords: string[];
  length: 'short' | 'medium' | 'long';
  tone: 'informative' | 'conversational' | 'authoritative' | 'persuasive' | 'news';
  contentMode: 'evergreen' | 'breaking' | 'trending' | 'event';
  eventName?: string;
  adUrl?: string;
}

/**
 * Generated blog data
 */
export interface BlogData {
  title: string;
  metaDescription: string;
  slug: string;
  content: string;
  wordCount: number;
  keywordsUsed: string[];
  seoScore: number;
  freshnessScore: number;
  newsRelevance: number;
  trendMatch: number;
  readabilityScore: number;
  liveEventsCount: number;
  trendAngle: string;
  currentEventHook: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  blog?: T;
  trending?: string[];
  image?: string;
  error?: string;
}
