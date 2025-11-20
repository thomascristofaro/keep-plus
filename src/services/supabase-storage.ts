import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Card } from '../types/index.ts';
import type { ICardStorage, DatabaseResult, QueryOptions } from './types.ts';
import { logger } from './logger.ts';

/**
 * Supabase table structure for cards
 */
interface SupabaseCard {
    id: number;
    title: string;
    cover_url?: string | null;
    link?: string | null;
    content?: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

/**
 * Supabase implementation of the card storage interface
 */
export class SupabaseCardStorage implements ICardStorage {
    private supabase: SupabaseClient;
    private readonly tableName = 'cards';
    private readonly migrationsTable = 'schema_migrations';
    private initialized = false;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async initialize(): Promise<DatabaseResult<void>> {
        if (this.initialized) {
            return { success: true };
        }

        try {
            logger.info('Initializing Supabase storage', undefined, 'SupabaseCardStorage');
            
            // Run migrations
            const migrationResult = await this.runMigrations();
            if (!migrationResult.success) {
                return migrationResult;
            }

            this.initialized = true;
            logger.info('Supabase storage initialized successfully', undefined, 'SupabaseCardStorage');
            return { success: true };
        } catch (error) {
            logger.error('Failed to initialize Supabase', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to initialize Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Run database migrations
     * Creates tables and applies schema changes
     */
    private async runMigrations(): Promise<DatabaseResult<void>> {
        try {
            // Check if migrations table exists, create if not
            await this.ensureMigrationsTable();

            // Get applied migrations
            const { data: appliedMigrations, error: fetchError } = await this.supabase
                .from(this.migrationsTable)
                .select('version')
                .order('version', { ascending: true });

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
                throw fetchError;
            }

            const appliedVersions = new Set(appliedMigrations?.map(m => m.version) || []);

            // Define all migrations
            const migrations = [
                {
                    version: 1,
                    name: 'create_cards_table',
                    up: async () => {
                        // Note: This uses Supabase RPC or SQL
                        // For production, you should create tables via Supabase Dashboard or SQL Editor
                        // This is a runtime check to ensure table exists
                        const { error } = await this.supabase
                            .from(this.tableName)
                            .select('id')
                            .limit(1);

                        // If table doesn't exist, we need to create it
                        // In Supabase, table creation is typically done via SQL editor
                        if (error && error.code === 'PGRST116') {
                            throw new Error(
                                'Cards table does not exist. Please run the following SQL in Supabase SQL Editor:\n\n' +
                                this.getCreateTableSQL()
                            );
                        }
                    }
                }
            ];

            // Apply pending migrations
            for (const migration of migrations) {
                if (!appliedVersions.has(migration.version)) {
                    logger.info(`Applying migration: ${migration.name}`, { version: migration.version }, 'SupabaseCardStorage');
                    
                    try {
                        await migration.up();
                        
                        // Record migration
                        await this.recordMigration(migration.version, migration.name);
                        
                        logger.info(`Migration ${migration.name} applied successfully`, undefined, 'SupabaseCardStorage');
                    } catch (migrationError) {
                        logger.error(`Migration ${migration.name} failed`, migrationError, 'SupabaseCardStorage');
                        throw migrationError;
                    }
                }
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Ensure migrations table exists
     */
    private async ensureMigrationsTable(): Promise<void> {
        const { error } = await this.supabase
            .from(this.migrationsTable)
            .select('version')
            .limit(1);

        if (error && error.code === 'PGRST116') {
            throw new Error(
                'Schema migrations table does not exist. Please run the following SQL in Supabase SQL Editor:\n\n' +
                this.getCreateMigrationsTableSQL()
            );
        }
    }

    /**
     * Record a migration as applied
     */
    private async recordMigration(version: number, name: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.migrationsTable)
            .insert({
                version,
                name,
                applied_at: new Date().toISOString()
            });

        if (error) {
            throw error;
        }
    }

    /**
     * Get SQL for creating migrations table
     */
    private getCreateMigrationsTableSQL(): string {
        return `
-- Create schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Enable all operations for authenticated users" ON schema_migrations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
`;
    }

    /**
     * Get SQL for creating cards table
     */
    private getCreateTableSQL(): string {
        return `
-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    cover_url TEXT,
    link TEXT,
    content TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_updated_at ON cards (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_title ON cards (title);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Adjust these policies based on your security requirements
CREATE POLICY "Enable read access for all users" ON cards
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON cards
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON cards
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON cards
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;
    }

    /**
     * Get setup instructions for Supabase
     */
    static getSetupInstructions(): string {
        return `
=== SUPABASE SETUP INSTRUCTIONS ===

1. Create a Supabase project at https://supabase.com

2. Go to SQL Editor in your Supabase dashboard

3. Run the migrations table SQL:
   - Copy the SQL from getCreateMigrationsTableSQL()
   - Paste and execute in SQL Editor

4. Run the cards table SQL:
   - Copy the SQL from getCreateTableSQL()
   - Paste and execute in SQL Editor

5. Get your credentials from Settings > API:
   - Project URL (VITE_SUPABASE_URL)
   - Anon/Public Key (VITE_SUPABASE_ANON_KEY)

6. Add to your .env file:
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key

7. Update storage-factory.ts to use Supabase provider

Note: The Row Level Security (RLS) policies in the SQL allow all operations
for authenticated users. Adjust these based on your security requirements.
`;
    }

    /**
     * Convert Supabase card format to app Card format
     */
    private fromSupabaseCard(dbCard: SupabaseCard): Card {
        return {
            id: dbCard.id,
            title: dbCard.title,
            coverUrl: dbCard.cover_url || undefined,
            link: dbCard.link || undefined,
            content: dbCard.content || undefined,
            tags: dbCard.tags || [],
            createdAt: new Date(dbCard.created_at),
            updatedAt: new Date(dbCard.updated_at)
        };
    }

    /**
     * Convert app Card format to Supabase format
     */
    private toSupabaseCard(card: Partial<Card>): Partial<SupabaseCard> {
        const dbCard: Partial<SupabaseCard> = {};
        
        if (card.id !== undefined) dbCard.id = card.id;
        if (card.title !== undefined) dbCard.title = card.title;
        if (card.coverUrl !== undefined) dbCard.cover_url = card.coverUrl || null;
        if (card.link !== undefined) dbCard.link = card.link || null;
        if (card.content !== undefined) dbCard.content = card.content || null;
        if (card.tags !== undefined) dbCard.tags = card.tags;
        if (card.createdAt !== undefined) dbCard.created_at = card.createdAt.toISOString();
        if (card.updatedAt !== undefined) dbCard.updated_at = card.updatedAt.toISOString();
        
        return dbCard;
    }

    async getCards(options?: QueryOptions): Promise<DatabaseResult<Card[]>> {
        try {
            await this.initialize();

            let query = this.supabase.from(this.tableName).select('*');

            // Apply filters
            if (options?.filters) {
                // Tag filter - using Postgres array contains operator
                if (options.filters.tags && options.filters.tags.length > 0) {
                    query = query.contains('tags', options.filters.tags);
                }

                // Search term filter
                if (options.filters.searchTerm) {
                    const searchTerm = `%${options.filters.searchTerm}%`;
                    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
                }

                // Date range filter
                if (options.filters.dateRange) {
                    query = query
                        .gte('created_at', options.filters.dateRange.from)
                        .lte('created_at', options.filters.dateRange.to);
                }
            }

            // Apply sorting
            const sortBy = options?.sortBy || 'updatedAt';
            const sortOrder = options?.sortOrder || 'desc';
            const dbSortBy = sortBy === 'createdAt' ? 'created_at' : 
                           sortBy === 'updatedAt' ? 'updated_at' : 
                           sortBy;
            query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            if (options?.limit) {
                query = query.limit(options.limit);
            }
            if (options?.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            const cards = (data || []).map(dbCard => this.fromSupabaseCard(dbCard as SupabaseCard));
            return { success: true, data: cards };
        } catch (error) {
            logger.error('Failed to get cards', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to get cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async getCard(id: number): Promise<DatabaseResult<Card | null>> {
        try {
            await this.initialize();

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return { success: true, data: null };
                }
                throw error;
            }

            return {
                success: true,
                data: data ? this.fromSupabaseCard(data as SupabaseCard) : null
            };
        } catch (error) {
            logger.error('Failed to get card', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to get card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<Card>> {
        try {
            await this.initialize();

            const dbCard = {
                title: cardData.title,
                cover_url: cardData.coverUrl || null,
                link: cardData.link || null,
                content: cardData.content || null,
                tags: cardData.tags || []
            };

            logger.debug('Creating card in Supabase', { title: cardData.title }, 'SupabaseCardStorage');

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(dbCard)
                .select()
                .single();

            if (error) {
                throw error;
            }

            logger.info('Card created successfully', { cardId: data.id }, 'SupabaseCardStorage');
            return {
                success: true,
                data: this.fromSupabaseCard(data as SupabaseCard)
            };
        } catch (error) {
            logger.error('Failed to create card', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to create card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async updateCard(id: number, updates: Partial<Card>): Promise<DatabaseResult<Card>> {
        try {
            await this.initialize();

            const dbUpdates = this.toSupabaseCard(updates);
            // Remove id and timestamps from updates
            delete dbUpdates.id;
            delete dbUpdates.created_at;
            // updated_at will be handled by trigger

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                data: this.fromSupabaseCard(data as SupabaseCard)
            };
        } catch (error) {
            logger.error('Failed to update card', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to update card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async deleteCard(id: number): Promise<DatabaseResult<void>> {
        try {
            await this.initialize();

            logger.debug('Deleting card from Supabase', { cardId: id }, 'SupabaseCardStorage');

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            logger.info('Card deleted successfully', { cardId: id }, 'SupabaseCardStorage');
            return { success: true };
        } catch (error) {
            logger.error('Failed to delete card', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to delete card: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async bulkCreateCards(cardsData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DatabaseResult<Card[]>> {
        try {
            await this.initialize();

            const dbCards = cardsData.map(cardData => ({
                title: cardData.title,
                cover_url: cardData.coverUrl || null,
                link: cardData.link || null,
                content: cardData.content || null,
                tags: cardData.tags || []
            }));

            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert(dbCards)
                .select();

            if (error) {
                throw error;
            }

            const cards = (data || []).map(dbCard => this.fromSupabaseCard(dbCard as SupabaseCard));
            return { success: true, data: cards };
        } catch (error) {
            logger.error('Failed to bulk create cards', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to bulk create cards: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async bulkDeleteCards(ids: number[]): Promise<DatabaseResult<void>> {
        try {
            await this.initialize();

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .in('id', ids);

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            logger.error('Failed to bulk delete cards', error, 'SupabaseCardStorage');
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
            await this.initialize();

            // Get all unique tags using array_agg and unnest
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('tags');

            if (error) {
                throw error;
            }

            const tagSet = new Set<string>();
            (data || []).forEach((row: { tags: string[] }) => {
                (row.tags || []).forEach(tag => tagSet.add(tag));
            });

            return {
                success: true,
                data: Array.from(tagSet).sort()
            };
        } catch (error) {
            logger.error('Failed to get tags', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async clearAll(): Promise<DatabaseResult<void>> {
        try {
            await this.initialize();

            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .neq('id', 0); // Delete all rows

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            logger.error('Failed to clear all cards', error, 'SupabaseCardStorage');
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
            await this.initialize();

            // Clear existing data
            const clearResult = await this.clearAll();
            if (!clearResult.success) {
                return clearResult;
            }

            // Import new data
            const dbCards = cards.map(card => ({
                id: card.id,
                title: card.title,
                cover_url: card.coverUrl || null,
                link: card.link || null,
                content: card.content || null,
                tags: card.tags || [],
                created_at: card.createdAt.toISOString(),
                updated_at: card.updatedAt.toISOString()
            }));

            const { error } = await this.supabase
                .from(this.tableName)
                .insert(dbCards);

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            logger.error('Failed to import data', error, 'SupabaseCardStorage');
            return {
                success: false,
                error: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
