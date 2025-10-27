import type { ICardStorage, StorageConfig } from './types.ts';
import { IndexedDBCardStorage } from './indexeddb-storage.ts';

/**
 * Future storage implementations placeholder
 */
// import { FirebaseCardStorage } from './firebase-storage.ts';
// import { SupabaseCardStorage } from './supabase-storage.ts';
// import { LocalStorageCardStorage } from './localstorage-storage.ts';

/**
 * Storage factory that creates the appropriate storage implementation
 * based on the configuration
 */
export class CardStorageFactory {
    private static instance: ICardStorage | null = null;
    
    /**
     * Get or create storage instance (Singleton pattern)
     */
    static getInstance(config?: StorageConfig): ICardStorage {
        if (!this.instance) {
            this.instance = this.createStorage(config);
        }
        return this.instance;
    }
    
    /**
     * Reset the singleton instance (useful for testing or switching providers)
     */
    static resetInstance(): void {
        this.instance = null;
    }
    
    /**
     * Create storage implementation based on provider
     */
    private static createStorage(config?: StorageConfig): ICardStorage {
        const provider = config?.provider || 'indexeddb';
        const options = config?.options || {};
        
        switch (provider) {
            case 'indexeddb':
                return new IndexedDBCardStorage(
                    options.dbName || 'KeepPlusDB',
                    options.dbVersion || 1
                );
                
            case 'localstorage':
                // TODO: Implement LocalStorageCardStorage
                throw new Error('LocalStorage provider not yet implemented');
                
            case 'firebase':
                // TODO: Implement FirebaseCardStorage
                // return new FirebaseCardStorage({
                //     apiKey: options.apiKey!,
                //     projectId: options.projectId!
                // });
                throw new Error('Firebase provider not yet implemented');
                
            case 'supabase':
                // TODO: Implement SupabaseCardStorage
                // return new SupabaseCardStorage({
                //     url: options.url!,
                //     anonKey: options.anonKey!
                // });
                throw new Error('Supabase provider not yet implemented');
                
            case 'memory':
                // TODO: Implement in-memory storage for testing
                throw new Error('Memory provider not yet implemented');
                
            default:
                throw new Error(`Unknown storage provider: ${provider}`);
        }
    }
    
    /**
     * Helper method to get a pre-configured storage instance
     */
    static getIndexedDBStorage(dbName?: string, dbVersion?: number): ICardStorage {
        return this.getInstance({
            provider: 'indexeddb',
            options: {
                dbName,
                dbVersion
            }
        });
    }
    
    /**
     * Helper method for future Firebase implementation
     */
    static getFirebaseStorage(apiKey: string, projectId: string): ICardStorage {
        return this.getInstance({
            provider: 'firebase',
            options: {
                apiKey,
                projectId
            }
        });
    }
    
    /**
     * Helper method for future Supabase implementation
     */
    static getSupabaseStorage(url: string, anonKey: string): ICardStorage {
        return this.getInstance({
            provider: 'supabase',
            options: {
                url,
                anonKey
            }
        });
    }
}

/**
 * Default storage instance - can be easily swapped by changing the provider
 */
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'indexeddb',
    options: {
        dbName: 'KeepPlusDB',
        dbVersion: 1,
        enableLogging: import.meta.env.DEV
    }
});

/**
 * Configuration-based storage creation
 * 
 * Usage examples:
 * 
 * // Development - use IndexedDB
 * const storage = createCardStorage({
 *   provider: 'indexeddb',
 *   options: { dbName: 'KeepPlusDev' }
 * });
 * 
 * // Production - use Firebase
 * const storage = createCardStorage({
 *   provider: 'firebase',
 *   options: {
 *     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
 *     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
 *   }
 * });
 */
export function createCardStorage(config: StorageConfig): ICardStorage {
    return CardStorageFactory.getInstance(config);
}

/**
 * Environment-based storage configuration
 */
export function getDefaultStorage(): ICardStorage {
    // You can customize this logic based on your deployment needs
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;
    
    if (isDevelopment) {
        // Use IndexedDB for development
        return CardStorageFactory.getIndexedDBStorage('KeepPlusDev');
    }
    
    if (isProduction) {
        // Check for cloud provider credentials
        const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        
        if (firebaseApiKey && firebaseProjectId) {
            return CardStorageFactory.getFirebaseStorage(firebaseApiKey, firebaseProjectId);
        }
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
            return CardStorageFactory.getSupabaseStorage(supabaseUrl, supabaseKey);
        }
        
        // Fallback to IndexedDB in production
        return CardStorageFactory.getIndexedDBStorage();
    }
    
    // Default fallback
    return CardStorageFactory.getIndexedDBStorage();
}