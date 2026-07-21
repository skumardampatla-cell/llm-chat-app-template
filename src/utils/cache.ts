/**
 * Caching utilities for blog generator
 */

import { Env } from '../types/env';

export async function getCacheKey(key: string, env: Env): Promise<string | null> {
  try {
    return await env.CACHE.get(key);
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
}

export async function setCacheKey(
  key: string,
  value: string,
  env: Env,
  ttl: number = 3600
): Promise<boolean> {
  try {
    await env.CACHE.put(key, value, { expirationTtl: ttl });
    return true;
  } catch (err) {
    console.error('Cache put error:', err);
    return false;
  }
}

export async function deleteCacheKey(key: string, env: Env): Promise<boolean> {
  try {
    await env.CACHE.delete(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err);
    return false;
  }
}

export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}
