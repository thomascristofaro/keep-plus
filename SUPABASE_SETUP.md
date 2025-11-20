# Supabase Integration Setup Guide

This guide walks you through setting up Supabase as the storage backend for Keep+.

## Prerequisites

- A Supabase account (create one at https://supabase.com)
- Node.js and npm installed
- Keep+ project cloned and dependencies installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in your project details:
   - Name: `keep-plus` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project" and wait for setup to complete (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

## Step 3: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the following SQL to create the migrations table:

\`\`\`sql
-- Create schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON schema_migrations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
\`\`\`

4. Click "Run" to execute
5. Create a new query and paste the following SQL to create the cards table:

\`\`\`sql
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

-- Create policy to allow all operations for all users (public access)
-- Note: Adjust these policies based on your security requirements
CREATE POLICY "Enable read access for all users" ON cards
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON cards
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON cards
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON cards
    FOR DELETE
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
\`\`\`

6. Click "Run" to execute

## Step 4: Configure Your Application

1. Copy `.env.example` to `.env`:
   \`\`\`powershell
   Copy-Item .env.example .env
   \`\`\`

2. Edit `.env` and add your Supabase credentials:
   \`\`\`env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   \`\`\`

3. (Optional) Set the storage provider explicitly:
   \`\`\`env
   VITE_STORAGE_PROVIDER=supabase
   \`\`\`

## Step 5: Update Storage Factory (if needed)

The storage factory automatically detects Supabase credentials and switches to Supabase in production. However, you can manually configure it:

\`\`\`typescript
// In src/services/storage-factory.ts
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'supabase',
    options: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
});
\`\`\`

## Step 6: Test Your Setup

1. Start the development server:
   \`\`\`powershell
   npm run dev
   \`\`\`

2. Open your browser to http://localhost:5173
3. Try creating, updating, and deleting cards
4. Check your Supabase dashboard > Table Editor > cards to see the data

## Security Considerations

### Row Level Security (RLS)

The provided SQL creates **public policies** that allow anyone to read, create, update, and delete cards. This is suitable for:
- Personal apps
- Prototypes
- Apps where all data is public

### For Production Apps with User Authentication

If you want user-specific data, modify the policies:

\`\`\`sql
-- Delete the public policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
DROP POLICY IF EXISTS "Enable insert for all users" ON cards;
DROP POLICY IF EXISTS "Enable update for all users" ON cards;
DROP POLICY IF EXISTS "Enable delete for all users" ON cards;

-- Add user_id column
ALTER TABLE cards ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create user-specific policies
CREATE POLICY "Users can view own cards" ON cards
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cards" ON cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON cards
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON cards
    FOR DELETE
    USING (auth.uid() = user_id);
\`\`\`

Then update your app to include authentication and set the user_id when creating cards.

## Switching Between Storage Providers

### Development: Use IndexedDB
\`\`\`typescript
// storage-factory.ts - default behavior with no .env
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'indexeddb'
});
\`\`\`

### Production: Use Supabase
\`\`\`typescript
// storage-factory.ts - with VITE_SUPABASE_* env vars
export const cardStorage = CardStorageFactory.getInstance({
    provider: 'supabase',
    options: {
        url: import.meta.env.VITE_SUPABASE_URL!,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!
    }
});
\`\`\`

The `getDefaultStorage()` function automatically handles this based on environment variables.

## Migration from IndexedDB to Supabase

To migrate existing data from IndexedDB to Supabase:

1. Export data from IndexedDB:
   \`\`\`typescript
   import { IndexedDBCardStorage } from './services/indexeddb-storage';
   
   const indexedDB = new IndexedDBCardStorage();
   const result = await indexedDB.exportData();
   console.log(JSON.stringify(result.data));
   \`\`\`

2. Import to Supabase:
   \`\`\`typescript
   import { SupabaseCardStorage } from './services/supabase-storage';
   
   const supabase = new SupabaseCardStorage(url, key);
   await supabase.importData(exportedData);
   \`\`\`

## Troubleshooting

### "Cards table does not exist" error
- Make sure you ran the SQL scripts in Supabase SQL Editor
- Check that the tables were created: Dashboard > Database > Tables

### "Row Level Security" errors
- Verify your RLS policies are created correctly
- For development, you can temporarily disable RLS:
  \`\`\`sql
  ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
  \`\`\`
  (Not recommended for production!)

### Connection errors
- Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check that your Supabase project is running (Dashboard should show "Active")
- Ensure you're using the **anon** key, not the **service_role** key

### CORS errors
- Supabase automatically handles CORS for your project URL
- If deploying to a custom domain, add it in Settings > API > API Settings > CORS

## Future Enhancements

The migration system is extensible for future schema changes:

1. Add a new migration in `supabase-storage.ts`:
   \`\`\`typescript
   const migrations = [
       { version: 1, name: 'create_cards_table', up: async () => {...} },
       { version: 2, name: 'add_favorite_column', up: async () => {...} }
   ];
   \`\`\`

2. The system automatically tracks and applies new migrations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Array Functions](https://www.postgresql.org/docs/current/functions-array.html)
