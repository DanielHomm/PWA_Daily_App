This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Setup

This project uses Supabase for the database and authentication. Below is the schema required for the Challenges feature.

### 1. Database Schema

#### `profiles` (Public profile information)
- `id`: uuid (Primary Key, references `auth.users.id`)
- `user_name`: text
- `avatar_url`: text

#### `challenges`
- `id`: uuid (Primary Key)
- `name`: text
- `description`: text
- `start_date`: date
- `end_date`: date
- `created_by`: uuid (references `auth.users.id`)
- `created_at`: timestamptz

#### `sub_challenges` (Tasks within a challenge)
- `id`: uuid (Primary Key)
- `challenge_id`: uuid (references `challenges.id`)
- `title`: text (e.g., "Daily Run")
- `frequency`: text ('daily', 'every_other_day', 'weekly', 'monthly')
- `created_at`: timestamptz

#### `challenge_members`
- `challenge_id`: uuid (references `challenges.id`)
- `user_id`: uuid (references `auth.users.id`)
- `role`: text ('owner', 'member')
- *Primary Key*: (challenge_id, user_id)

#### `challenge_checkins`
- `id`: uuid (Primary Key)
- `challenge_id`: uuid (references `challenges.id`)
- `sub_challenge_id`: uuid (references `sub_challenges.id`)
- `user_id`: uuid (references `auth.users.id`)
- `date`: date (YYYY-MM-DD)
- *Unique Constraint*: (user_id, date, sub_challenge_id)

## Authentication & Users

### Profiles Table
Each user has a profile in the `public.profiles` table, linked to `auth.users` via `id`.
- `id` (uuid, PK, references auth.users)
- `user_name` (text, unique)
- `role` (text): 'user' or 'admin'
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `created_at` (timestamptz)

### RLS Policies
- `common_items`: Readable by everyone. Writable (insert/update) by admins only.
- `households` & `household_members`: Standard tenancy model.

### 2. Row Level Security (RLS) Policies

**`challenges`**
- **SELECT**: Authenticated users can view challenges they created OR are members of.
- **INSERT**: Authenticated users can create challenges.
- **UPDATE/DELETE**: Only the `created_by` user (owner) can update or delete.

**`challenge_members`**
- **SELECT**: Members can view other members of the same challenge.
- **INSERT**: Owners can add members; Users can join (depending on implementation).
- **UPDATE**: Owners can promote/demote (e.g. ownership transfer).
- **DELETE**: Owners can remove members; Members can remove themselves (leave).

**`challenge_checkins`**
- **SELECT**: Visible to all members of the challenge.
- **INSERT**: Users can only insert check-ins for themselves (`auth.uid() = user_id`).

### 3. Kitchen & Household Schema

#### `grocery_categories` (Seeded)
- `id`: uuid (Primary Key)
- `name`: text (Unique)
- `icon`: text (Emoji)
- `sort_order`: int
- **RLS**: Public read-only.

#### `households` (Tenancy Unit)
- `id`: uuid (Primary Key)
- `name`: text
- `invite_code`: text (Unique, 6-char)
- `created_by`: uuid (references `auth.users.id`)
- **RLS**: Visible to members only.

#### `household_members`
- `household_id`: uuid (references `households.id`)
- `user_id`: uuid (references `auth.users.id`)
- `role`: text ('admin', 'member')
- **RLS**: Visible to members of the same household.

#### `household_products` (Defined items in household)
- `id`: uuid (Primary Key)
- `household_id`: uuid (references `households.id`)
- `name`: text
- `category_id`: uuid (references `grocery_categories.id`)

#### `inventory_items` (Actual stock)
- `id`: uuid (Primary Key)
- `household_id`: uuid
- `product_id`: uuid
- `location`: text ('fridge', 'freezer', 'pantry')
- `quantity`: numeric
- `expiry_date`: date

#### `shopping_list_items`
- `id`: uuid (Primary Key)
- `household_id`: uuid
- `product_id`: uuid
- `is_checked`: boolean
- `quantity`: numeric

### 4. Community Pricing Schema

#### `supermarket_chains` (Global, Seeded)
- `id`: uuid
- `name`: text
- `icon`: text
- **RLS**: Public read.

#### `supermarket_stores` (User generated locations)
- `id`: uuid
- `chain_id`: uuid
- `name`: text (e.g. "Main St")
- **RLS**: Public read, Authenticated create.

#### `product_prices` (Crowdsourced)
- `id`: uuid
- `common_item_id`: uuid (Global item reference)
- `store_id`: uuid
- `price`: numeric
- **RLS**: Public read, Authenticated create.

### 5. Recipes & Planner Schema

#### `recipes`
- `id`: uuid
- `household_id`: uuid
- `name`: text
- `description`: text (Instructions)
- `default_servings`: numeric
- `cook_time_minutes`: numeric
- `prep_time_minutes`: numeric

#### `recipe_ingredients`
- `id`: uuid
- `recipe_id`: uuid (references `recipes.id`)
- `common_item_id`: uuid (Optional, reference to global items)
- `name`: text (Fallback name if no common item)
- `quantity`: numeric
- `unit`: text

### 6. AI Features (Magic Import)

#### Recipe Extraction Pipeline
The app features a "Magic Import" for recipes that uses a multi-stage AI pipeline:
1.  **Jina AI Reader**: Fetches public URLs and converts "dirty" HTML into clean, token-efficient Markdown.
2.  **Google Gemini 1.5 Flash**: Parses the Markdown to extract:
    *   Title, Description, Instructions
    *   Prep/Cook Times (with inference logic)
    *   Ingredients (structured data)
    *   Spices (separated from shopping list items)
3.  **Localization**: Automatically detects the user's app language (English/German) and instructs the LLM to translate all extracted content accordingly.

#### APIs Used
- `api/ai/extract-recipe`: Proxies requests to Jina and Gemini. Requires `GEMINI_API_KEY`.

#### `meal_plans`
- `id`: uuid
- `household_id`: uuid
- `date`: date
- `meal_type`: text ('breakfast', 'lunch', 'dinner')
- `recipe_id`: uuid (Optional link)
- `custom_text`: text (Optional text)

### Household RLS Policies Summary
- **Households/Inventory/Recipes/Plans**: Strictly scoped to `household_members`. Users can only access data for households they have joined.
- **Pricing/Chains**: Open data model. Anyone can read, any authenticated user can contribute (create stores/prices).
- **Invite Logic**: `join_household_by_code` is a `SECURITY DEFINER` function to bypass RLS for the initial lookup of the code, allowing users to find and join a household they don't yet have access to.
