import type { EnhancementCache, FieldEnhancement } from '../types';

interface CacheEntry {
  value: FieldEnhancement;
  expiresAt: number;
}

export class SimpleMemoryCache implements EnhancementCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTLSeconds = 3600) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get(key: string): FieldEnhancement | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: FieldEnhancement, ttlSeconds?: number): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  static createCacheKey(context: {
    type?: string;
    name?: string;
    label?: string;
    placeholder?: string;
  }): string {
    return `${context.type || ''}_${context.name || ''}_${context.label || ''}_${context.placeholder || ''}`.toLowerCase();
  }
}
