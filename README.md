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
