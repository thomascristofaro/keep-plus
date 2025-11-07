import type { Card } from '../types/index.ts';

/**
 * Generic result type for database operations
 */
export interface DatabaseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Query options for filtering and pagination
 */
export interface QueryOptions {
    limit?: number;
    offset?: number;
    sortBy?: keyof Card;
    sortOrder?: 'asc' | 'desc';
    filters?: {
        tags?: string[];
        searchTerm?: string;
        dateRange?: {
            from: string;
            to: string;
        };
    };
}

/**
 * Abstract interface for card storage operations
 * This interface can be implemented by IndexedDB, Firebase, Supabase, etc.
 */
export interface ICardStorage {
    /**
     * Initialize the storage connection
     */
    initialize(): Promise<DatabaseResult<void>>;

    /**
     * Get all cards with optional filtering
     */
    getCards(options?: QueryOptions): Promise<DatabaseResult<Card[]>>;

    /**
     * Get a single card by ID
     */
    getCard(id: number): Promise<DatabaseResult<Card | null>>;

    /**
     * Create a new card
     */
    createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<Card>>;

    /**
     * Update an existing card
     */
    updateCard(id: number, updates: Partial<Card>): Promise<DatabaseResult<Card>>;

    /**
     * Delete a card
     */
    deleteCard(id: number): Promise<DatabaseResult<void>>;

    /**
     * Bulk operations for better performance
     */
    bulkCreateCards(cards: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DatabaseResult<Card[]>>;
    bulkDeleteCards(ids: number[]): Promise<DatabaseResult<void>>;

    /**
     * Search operations
     */
    searchCards(query: string): Promise<DatabaseResult<Card[]>>;
    getCardsByTag(tag: string): Promise<DatabaseResult<Card[]>>;

    /**
     * Get all unique tags
     */
    getAllTags(): Promise<DatabaseResult<string[]>>;

    /**
     * Clear all data (useful for testing or reset)
     */
    clearAll(): Promise<DatabaseResult<void>>;

    /**
     * Export all data for backup
     */
    exportData(): Promise<DatabaseResult<Card[]>>;

    /**
     * Import data from backup
     */
    importData(cards: Card[]): Promise<DatabaseResult<void>>;
}

/**
 * Storage provider types
 */
export type StorageProvider = 'indexeddb' | 'localstorage' | 'firebase' | 'supabase' | 'memory';

/**
 * Configuration for storage providers
 */
export interface StorageConfig {
    provider: StorageProvider;
    options?: {
        // IndexedDB options
        dbName?: string;
        dbVersion?: number;
        
        // Firebase options
        apiKey?: string;
        projectId?: string;
        
        // Supabase options
        url?: string;
        anonKey?: string;
        
        // General options
        enableLogging?: boolean;
        retryAttempts?: number;
    };
}