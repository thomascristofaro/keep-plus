# Keep Plus - Storage Architecture

## Overview

Keep Plus uses a layered storage architecture that provides a clean abstraction between the UI and data persistence. This allows you to easily switch between different storage providers (IndexedDB, Firebase, Supabase, etc.) without changing the application logic.

## Architecture

```
┌─────────────────┐
│   React App     │ ← Your UI components
├─────────────────┤
│  useCardStorage │ ← Custom hook (state management)
├─────────────────┤
│ Storage Factory │ ← Provider selection & configuration
├─────────────────┤
│ ICardStorage    │ ← Common interface for all providers
├─────────────────┤
│ Concrete        │ ← Actual storage implementations
│ Implementations │   (IndexedDB, Firebase, Supabase, etc.)
└─────────────────┘
```

## Current Implementation

### 1. **Interface Layer** (`src/services/types.ts`)
- `ICardStorage`: Common interface for all storage providers
- `DatabaseResult<T>`: Standardized result type with success/error handling
- `QueryOptions`: Flexible querying and filtering options
- `StorageConfig`: Configuration for different providers

### 2. **IndexedDB Implementation** (`src/services/indexeddb-storage.ts`)
- Full CRUD operations with async/await
- Built-in indexing for fast searching by title, tags, and dates
- Transaction support for data integrity
- Bulk operations for better performance
- Error handling with detailed messages

### 3. **Supabase Implementation** (`src/services/supabase-storage.ts`) ✅ **NEW**
- PostgreSQL-backed cloud storage
- Full CRUD operations with real-time capabilities
- Built-in migration system for schema management
- Automatic table creation with proper indexes
- Row Level Security (RLS) support
- GIN indexes for efficient tag searching
- Auto-updating timestamps via database triggers

### 4. **Storage Factory** (`src/services/storage-factory.ts`)
- Singleton pattern for consistent storage instances
- Environment-based provider selection
- Easy switching between providers
- Configuration management

### 5. **React Hook** (`src/hooks/useCardStorage.ts`)
- State management for cards, loading, and errors
- Automatic initialization with fallback to initial data
- All CRUD operations exposed as hook methods
- Error handling and user feedback

## Switching Storage Providers

### Current (IndexedDB)
```typescript
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'indexeddb',
    options: {
        dbName: 'KeepPlusDB',
        dbVersion: 1
    }
});
```

### Future Cloud Providers

#### Supabase ✅ **IMPLEMENTED**
```typescript
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'supabase',
    options: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
});
```

See `SUPABASE_SETUP.md` for detailed setup instructions.

#### Firebase Firestore (Coming Soon)
```typescript
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'firebase',
    options: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
    }
});
```

## Implementing New Storage Providers

To add a new storage provider (e.g., Firebase), follow these steps:

### 1. Create Implementation
```typescript
// src/services/firebase-storage.ts
export class FirebaseCardStorage implements ICardStorage {
    // Implement all ICardStorage methods
    async initialize(): Promise<DatabaseResult<void>> { /* ... */ }
    async getCards(): Promise<DatabaseResult<Card[]>> { /* ... */ }
    async createCard(): Promise<DatabaseResult<Card>> { /* ... */ }
    // ... other methods
}
```

### 2. Update Factory
```typescript
// src/services/storage-factory.ts
case 'firebase':
    return new FirebaseCardStorage({
        apiKey: options.apiKey!,
        projectId: options.projectId!
    });
```

### 3. Update Types
```typescript
// src/services/types.ts
export type StorageProvider = 'indexeddb' | 'firebase' | 'supabase' | 'localstorage';
```

## Benefits of This Architecture

### ✅ **Easy Provider Switching**
Change one line in the factory to switch from IndexedDB to Firebase

### ✅ **Consistent API**
All storage providers implement the same interface, so UI code never changes

### ✅ **Type Safety**
Full TypeScript support with proper error handling

### ✅ **Scalability**
Start with IndexedDB for local storage, migrate to cloud when needed

### ✅ **Testing**
Easy to mock storage for unit tests by implementing the interface

### ✅ **Environment Configuration**
Different providers for development/production environments

## Usage Examples

### Basic Usage
```typescript
const { cards, addCard, updateCard, deleteCard, loading, error } = useCardStorage();

// Add a new card
await addCard({
    title: 'New Card',
    description: 'Card description',
    url: 'https://example.com',
    type: 'link',
    tags: ['example', 'demo']
});
```

### Advanced Querying
```typescript
// Search cards
const results = await storage.searchCards('react');

// Get cards by tag
const reactCards = await storage.getCardsByTag('react');

// Get cards with pagination and sorting
const pagedCards = await storage.getCards({
    limit: 10,
    offset: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: {
        tags: ['work'],
        searchTerm: 'project'
    }
});
```

### Data Migration
```typescript
// Export current data
const backup = await storage.exportData();

// Switch provider in factory
// Import data to new provider
await newStorage.importData(backup.data);
```

## Environment Variables

For cloud providers, add these to your `.env` file:

```env
# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Migration Path

1. **Phase 1**: Local development with IndexedDB ✅ **Complete**
2. **Phase 2**: Add Supabase implementation ✅ **Complete**
3. **Phase 3**: Environment-based provider selection ✅ **Complete**
4. **Phase 4**: Data migration tools for existing users
5. **Phase 5**: Add Firebase implementation
6. **Phase 6**: Advanced features (real-time sync, offline support)

## Supabase Features

The Supabase implementation includes several advanced features:

### Database Migrations
- Automatic schema versioning and tracking
- Migration history stored in `schema_migrations` table
- Easy to add new migrations for schema changes
- SQL generation for manual table creation

### Row Level Security (RLS)
- Fine-grained access control
- Configurable policies for read/write operations
- Support for authenticated and public access patterns

### Performance Optimizations
- GIN indexes for array column (tags) searches
- B-tree indexes on timestamp and title columns
- Automatic timestamp updates via PostgreSQL triggers
- Efficient bulk operations

### Developer Experience
- Comprehensive error messages
- Setup helper script (`supabase-setup-helper.ts`)
- Detailed documentation in `SUPABASE_SETUP.md`
- SQL generation methods for easy table creation

This architecture ensures your app can grow from a simple local tool to a full-scale cloud application without rewriting the core logic.