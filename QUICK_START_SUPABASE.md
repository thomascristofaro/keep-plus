# Quick Start - Supabase Integration

## TL;DR - Get Started in 5 Minutes

### 1. Install (Already Done ✓)
```powershell
npm install @supabase/supabase-js
```

### 2. Create Supabase Project
1. Go to https://supabase.com → New Project
2. Wait ~2 minutes for setup

### 3. Run SQL
Go to SQL Editor in Supabase dashboard and run these two queries:

**Query 1 - Migrations Table:**
```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for authenticated users" ON schema_migrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

**Query 2 - Cards Table:**
```sql
CREATE TABLE cards (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    cover_url TEXT,
    link TEXT,
    content TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_tags ON cards USING GIN (tags);
CREATE INDEX idx_cards_created_at ON cards (created_at DESC);
CREATE INDEX idx_cards_updated_at ON cards (updated_at DESC);
CREATE INDEX idx_cards_title ON cards (title);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON cards FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON cards FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON cards FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configure Environment
```powershell
# Copy example env file
Copy-Item .env.example .env

# Edit .env and add your credentials
# (Get from Supabase → Settings → API)
```

Add to `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### 5. That's It! 🎉

Start your app - it will automatically use Supabase:
```powershell
npm run dev
```

The storage factory automatically detects Supabase credentials and switches from IndexedDB to Supabase. No code changes needed!

---

## How It Works

The app automatically selects storage provider in this priority:

1. **Supabase** - If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. **Firebase** - If `VITE_FIREBASE_*` vars are set (not yet implemented)
3. **IndexedDB** - Fallback (local browser storage)

## Verification

Check which provider is active:
```javascript
// Open browser console
import { cardStorage } from './services/storage-factory';
console.log(cardStorage.constructor.name);
// Should show: SupabaseCardStorage
```

## Switching Back to IndexedDB

Just remove or rename your `.env` file:
```powershell
Rename-Item .env .env.backup
```

Restart the dev server - it will use IndexedDB again.

## Common Issues

### "Cards table does not exist"
- You didn't run the SQL scripts in Supabase
- Go to Dashboard → SQL Editor → Run both queries

### Still using IndexedDB?
- Check your `.env` file exists and has correct values
- Restart `npm run dev` after adding environment variables
- Verify no syntax errors in `.env` (no quotes needed for values)

### Can't connect
- Wrong URL or key → Check Dashboard → Settings → API
- Using `service_role` key? → Use `anon` key instead
- Supabase project paused? → Check project status in dashboard

## Next Steps

- Read full setup guide: `SUPABASE_SETUP.md`
- Implementation details: `SUPABASE_IMPLEMENTATION.md`
- Architecture overview: `STORAGE_ARCHITECTURE.md`

## Migration from IndexedDB

See `SUPABASE_SETUP.md` section "Migration from IndexedDB to Supabase" for data export/import instructions.
