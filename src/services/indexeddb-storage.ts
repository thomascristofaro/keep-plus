import type { Card } from '../types/index.ts';
import type { ICardStorage, DatabaseResult, QueryOptions } from './types.ts';
import { logger } from './logger.ts';

/**
 * IndexedDB implementation of the card storage interface
 */
export class IndexedDBCardStorage implements ICardStorage {
    private db: IDBDatabase | null = null;
    private readonly dbName: string;
    private readonly dbVersion: number;
    private readonly storeName = 'cards';

    constructor(dbName = 'KeepPlusDB', dbVersion = 2) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }

    async initialize(): Promise<DatabaseResult<void>> {
        try {
            logger.info('Initializing IndexedDB', { dbName: this.dbName, dbVersion: this.dbVersion }, 'IndexedDBCardStorage');
            await this.openDatabase();
            logger.info('IndexedDB initialized successfully', undefined, 'IndexedDBCardStorage');
            return { success: true };
        } catch (error) {
            logger.error('Failed to initialize IndexedDB', error, 'IndexedDBCardStorage');
            return {
                success: false,
                error: `Failed to initialize IndexedDB: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    private openDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    
                    // Create indexes for better querying
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                } else {
                    // Update existing store if needed
                    const transaction = (event.target as IDBOpenDBRequest).transaction!;
                    const store = transaction.objectStore(this.storeName);
                    
                    // Remove old indexes if they exist
                    if (store.indexNames.contains('created_at')) {
                        store.deleteIndex('created_at');
                    }
                    if (store.indexNames.contains('type')) {
                        store.deleteIndex('type');
                    }
                    
                    // Add new indexes if they don't exist
                    if (!store.indexNames.contains('createdAt')) {
                        store.createIndex('createdAt', 'createdAt', { unique: false });
                    }
                    if (!store.indexNames.contains('updatedAt')) {
                        store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    }
                }
            };
        });
    }

    private async ensureConnection(): Promise<void> {
        if (!this.db) {
            await this.openDatabase();
        }
    }

    private generateId(): number {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    async getCards(options?: QueryOptions): Promise<DatabaseResult<Card[]>> {
        try {
            await this.ensureConnection();
            
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.getAll();
                
                request.onsuccess = () => {
                    let cards: Card[] = request.result;
                    
                    // Apply filters
                    if (options?.filters) {
                        cards = this.applyFilters(cards, options.filters);
                    }
                    
                    // Apply sorting
                    if (options?.sortBy) {
                        cards = this.applySorting(cards, options.sortBy, options.sortOrder || 'desc');
                    }
                    
                    // Apply pagination
                    if (options?.limit || options?.offset) {
                        const start = options.offset || 0;
                        const end = start + (options.limit || cards.length);
                        cards = cards.slice(start, end);
                    }
                    
                    resolve({ success: true, data: cards });
                };
                
                request.onerror = () => {
                    resolve({
                        success: false,
                        error: `Failed to get cards: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to get cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    private applyFilters(cards: Card[], filters: NonNullable<QueryOptions['filters']>): Card[] {
        return cards.filter(card => {
            // Tag filter
            if (filters.tags && filters.tags.length > 0) {
                const hasMatchingTag = filters.tags.some(tag => card.tags.includes(tag));
                if (!hasMatchingTag) return false;
            }
            
            // Search term filter
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const matchesSearch = 
                    card.title.toLowerCase().includes(searchLower) ||
                    (card.content && card.content.toLowerCase().includes(searchLower)) ||
                    card.tags.some(tag => tag.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }
            
            // Date range filter
            if (filters.dateRange) {
                const createdAt = card.createdAt instanceof Date 
                    ? card.createdAt.toISOString() 
                    : String(card.createdAt);
                if (createdAt < filters.dateRange.from || createdAt > filters.dateRange.to) {
                    return false;
                }
            }
            
            return true;
        });
    }

    private applySorting(cards: Card[], sortBy: keyof Card, sortOrder: 'asc' | 'desc'): Card[] {
        return cards.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            
            if (aValue === undefined || bValue === undefined) return 0;
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    async getCard(id: number): Promise<DatabaseResult<Card | null>> {
        try {
            await this.ensureConnection();
            
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.get(id);
                
                request.onsuccess = () => {
                    resolve({
                        success: true,
                        data: request.result || null
                    });
                };
                
                request.onerror = () => {
                    resolve({
                        success: false,
                        error: `Failed to get card: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to get card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<Card>> {
        try {
            await this.ensureConnection();
            
            const now = new Date();
            const card: Card = {
                ...cardData,
                id: this.generateId(),
                createdAt: now,
                updatedAt: now
            };
            
            logger.debug('Creating card', { cardId: card.id, title: card.title }, 'IndexedDBCardStorage');
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.add(card);
                
                request.onsuccess = () => {
                    logger.info('Card created successfully', { cardId: card.id }, 'IndexedDBCardStorage');
                    resolve({ success: true, data: card });
                };
                
                request.onerror = () => {
                    logger.error('Failed to create card', request.error, 'IndexedDBCardStorage');
                    resolve({
                        success: false,
                        error: `Failed to create card: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            logger.error('Exception while creating card', error, 'IndexedDBCardStorage');
            return {
                success: false,
                error: `Failed to create card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async updateCard(id: number, updates: Partial<Card>): Promise<DatabaseResult<Card>> {
        try {
            await this.ensureConnection();
            
            // First get the existing card
            const existingResult = await this.getCard(id);
            if (!existingResult.success || !existingResult.data) {
                return {
                    success: false,
                    error: 'Card not found'
                };
            }
            
            const updatedCard: Card = {
                ...existingResult.data,
                ...updates,
                id, // Ensure ID doesn't change
                updatedAt: new Date() // Update timestamp
            };
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.put(updatedCard);
                
                request.onsuccess = () => {
                    resolve({ success: true, data: updatedCard });
                };
                
                request.onerror = () => {
                    resolve({
                        success: false,
                        error: `Failed to update card: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to update card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async deleteCard(id: number): Promise<DatabaseResult<void>> {
        try {
            await this.ensureConnection();
            
            logger.debug('Deleting card', { cardId: id }, 'IndexedDBCardStorage');
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    logger.info('Card deleted successfully', { cardId: id }, 'IndexedDBCardStorage');
                    resolve({ success: true });
                };
                
                request.onerror = () => {
                    logger.error('Failed to delete card', request.error, 'IndexedDBCardStorage');
                    resolve({
                        success: false,
                        error: `Failed to delete card: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            logger.error('Exception while deleting card', error, 'IndexedDBCardStorage');
            return {
                success: false,
                error: `Failed to delete card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async bulkCreateCards(cardsData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DatabaseResult<Card[]>> {
        try {
            await this.ensureConnection();
            
            const now = new Date();
            const cards: Card[] = cardsData.map(cardData => ({
                ...cardData,
                id: this.generateId(),
                createdAt: now,
                updatedAt: now
            }));
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                let completed = 0;
                const errors: string[] = [];
                
                cards.forEach(card => {
                    const request = store.add(card);
                    
                    request.onsuccess = () => {
                        completed++;
                        if (completed === cards.length) {
                            if (errors.length > 0) {
                                resolve({
                                    success: false,
                                    error: `Some cards failed to create: ${errors.join(', ')}`
                                });
                            } else {
                                resolve({ success: true, data: cards });
                            }
                        }
                    };
                    
                    request.onerror = () => {
                        errors.push(card.title);
                        completed++;
                        if (completed === cards.length) {
                            resolve({
                                success: false,
                                error: `Failed to create cards: ${errors.join(', ')}`
                            });
                        }
                    };
                });
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to bulk create cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async bulkDeleteCards(ids: number[]): Promise<DatabaseResult<void>> {
        try {
            await this.ensureConnection();
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                let completed = 0;
                const errors: string[] = [];
                
                ids.forEach(id => {
                    const request = store.delete(id);
                    
                    request.onsuccess = () => {
                        completed++;
                        if (completed === ids.length) {
                            if (errors.length > 0) {
                                resolve({
                                    success: false,
                                    error: `Some cards failed to delete: ${errors.join(', ')}`
                                });
                            } else {
                                resolve({ success: true });
                            }
                        }
                    };
                    
                    request.onerror = () => {
                        errors.push(id.toString());
                        completed++;
                        if (completed === ids.length) {
                            resolve({
                                success: false,
                                error: `Failed to delete cards: ${errors.join(', ')}`
                            });
                        }
                    };
                });
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to bulk delete cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async searchCards(query: string): Promise<DatabaseResult<Card[]>> {
        return this.getCards({
            filters: { searchTerm: query }
        });
    }

    async getCardsByTag(tag: string): Promise<DatabaseResult<Card[]>> {
        return this.getCards({
            filters: { tags: [tag] }
        });
    }

    async getAllTags(): Promise<DatabaseResult<string[]>> {
        try {
            const cardsResult = await this.getCards();
            if (!cardsResult.success || !cardsResult.data) {
                return {
                    success: false,
                    error: cardsResult.error || 'Failed to get cards'
                };
            }
            
            const tagSet = new Set<string>();
            cardsResult.data.forEach(card => {
                card.tags.forEach(tag => tagSet.add(tag));
            });
            
            return {
                success: true,
                data: Array.from(tagSet).sort()
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async clearAll(): Promise<DatabaseResult<void>> {
        try {
            await this.ensureConnection();
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                const request = store.clear();
                
                request.onsuccess = () => {
                    resolve({ success: true });
                };
                
                request.onerror = () => {
                    resolve({
                        success: false,
                        error: `Failed to clear all cards: ${request.error?.message}`
                    });
                };
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to clear all cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async exportData(): Promise<DatabaseResult<Card[]>> {
        return this.getCards();
    }

    async importData(cards: Card[]): Promise<DatabaseResult<void>> {
        try {
            // Clear existing data first
            const clearResult = await this.clearAll();
            if (!clearResult.success) {
                return clearResult;
            }
            
            // Import new data
            await this.ensureConnection();
            
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            return new Promise((resolve) => {
                let completed = 0;
                const errors: string[] = [];
                
                cards.forEach(card => {
                    const request = store.add(card);
                    
                    request.onsuccess = () => {
                        completed++;
                        if (completed === cards.length) {
                            if (errors.length > 0) {
                                resolve({
                                    success: false,
                                    error: `Some cards failed to import: ${errors.join(', ')}`
                                });
                            } else {
                                resolve({ success: true });
                            }
                        }
                    };
                    
                    request.onerror = () => {
                        errors.push(card.title);
                        completed++;
                        if (completed === cards.length) {
                            resolve({
                                success: false,
                                error: `Failed to import cards: ${errors.join(', ')}`
                            });
                        }
                    };
                });
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}