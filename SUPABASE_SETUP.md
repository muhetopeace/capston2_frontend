# Supabase Database Connection Setup

## Problem
If you're getting a `PrismaClientInitializationError` saying "Can't reach database server", it's likely because you're using the wrong connection string format for Supabase with Next.js.

**Common mistake:** Using `db.[project-ref].supabase.co:6543` - this won't work! The direct connection hostname only works with port 5432.

## Solution

### For Next.js Serverless Functions (Recommended)

Use the **Connection Pooler** connection string from Supabase. This is the correct format for serverless environments:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find the **Connection Pooling** section
4. Copy the **Connection string** (it should use port **6543**)

The connection string should look like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:** Notice the hostname is `aws-0-[region].pooler.supabase.com`, NOT `db.[project-ref].supabase.co`

### Alternative: Direct Connection (for migrations only)

If you need to use the direct connection (port 5432) for migrations, use:
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Note:** 
- Direct connections (port 5432) may not work reliably in serverless environments
- You CANNOT mix hostnames and ports (e.g., `db.[project-ref].supabase.co:6543` will NOT work)
- Use the pooled connection (port 6543) for your application

## Environment Variable Setup

Create or update your `.env` file:

```env
# Use the pooled connection string for Next.js (RECOMMENDED)
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Or if using direct connection (for migrations only, NOT recommended for app)
# Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
# DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Quick Fix for Your Current Issue

Based on your error, your project reference is `ehcdumklnsdwbplabfby`. You need to:

1. **Get your region** from Supabase dashboard (Settings → Database → Connection Pooling)
2. **Get your database password** (the one you set when creating the project)
3. **Use this format** (replace `[password]` and `[region]`):

```env
DATABASE_URL="postgresql://postgres.ehcdumklnsdwbplabfby:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Example** (if your region is `us-east-1`):
```env
DATABASE_URL="postgresql://postgres.ehcdumklnsdwbplabfby:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Important Notes

1. **Replace placeholders:**
   - `[project-ref]` - Your Supabase project reference ID
   - `[password]` - Your database password (URL-encoded if it contains special characters)
   - `[region]` - Your Supabase region (e.g., `us-east-1`)

2. **URL Encoding:** If your password contains special characters, encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `$` becomes `%24`
   - etc.

3. **Connection Pooling:** The pooled connection (`?pgbouncer=true`) is essential for serverless functions to prevent connection limit issues.

## After Updating DATABASE_URL

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. If you still have issues, regenerate the Prisma client:
   ```bash
   npx prisma generate
   ```

3. Test the connection:
   ```bash
   npx prisma db pull
   ```

## Troubleshooting

- **Still can't connect?** Check that your Supabase database is running and accessible
- **Connection timeout?** Verify your IP is not blocked in Supabase firewall settings
- **Wrong credentials?** Double-check your password and project reference ID

