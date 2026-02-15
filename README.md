# SVARNEX - The Autonomous Website Factory

## Project Overview
Svarnex is an AI-powered website builder featuring cinematic 3D visuals, autonomous component generation, and one-click deployment.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **3D Graphics:** React Three Fiber + Drei
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL + Auth)
- **AI:** OpenAI API (GPT-4o)
- **Payments:** Razorpay / Stripe
- **Hosting:** Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Follow the detailed guide in [`/supabase/SETUP.md`](./supabase/SETUP.md)
   - Run the SQL schema in your Supabase project
   - Enable required extensions (uuid-ossp, vector)

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Supabase, OpenAI, and payment gateway credentials.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Test Supabase connection:
   - Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - Should return: `{"success": true, "message": "Supabase connection successful! ✅"}`

## Project Structure

```
/app
  /(site)          # Marketing website
  /(app)           # Protected dashboard area
    /dashboard     # Main user dashboard
  /api             # API routes
    /health        # Supabase connection test
    /blocks        # Block management endpoints
  layout.tsx       # Root layout with theme provider
  page.tsx         # Landing page
  globals.css      # Global styles

/components
  /factory         # Generated component blocks (AI-generated)
  theme-provider.tsx
  smooth-scroll-wrapper.tsx

/lib
  /supabase        # Legacy - use /utils/supabase instead

/utDatabase Schema

The complete PostgreSQL schema is in [`/supabase/schema.sql`](./supabase/schema.sql).

### Tables:
- **users** - User profiles with subscription tiers and credits
- **blocks** - AI-generated React components with vector embeddings
- **projects** - User websites (array of blocks + configuration)

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Vector embeddings for AI-powered search
- ✅ Automatic triggers for timestamps and user profiles
- ✅ Helper functions for credits and search

See [`/supabase/SETUP.md`](./supabase/SETUP.md) for detailed setup instructions.
  /supabase        # Supabase client utilities
    server.ts      # Server-side client (Server Components, API routes)
    client.ts  

### Implemented ✅
- Project structure with Next.js 14 App Router
- Dark mode theme system with smooth scrolling
- Supabase integration with TypeScript types
- Authentication middleware
- Database schema with RLS policies
- API routes for blocks management
- Vector search ready (pgvector)

### Planned 🔄ser-side client (Client Components)
    middleware.ts  # Session management

/types
  database.ts      # TypeScript types for Supabase schema

/supabase
  schema.sql       # Database schema (run in Supabase SQL Editor)
  SETUP.md         # Detailed Supabase setup guide

/public            # Static assets

middleware.ts      # Next.js middleware (auth handling)
```

## Key Features (Planned)
- 🎨 Cinematic 3D landing experience
- 🤖 Autonomous AI component generation
- 💎 Glassmorphism dashboard UI
- 🔍 Vector-search component library
- 🚀 One-click deployment
- 📱 Fully responsive design

## Development Roadmap
1. ✅ Project initialization (Next.js 14, TypeScript, Tailwind)
2. ✅ Supabase integration and database schema
3. 🔄 Authentication system (login/signup pages)
4. 🔄 3D landing page with React Three Fiber
5. 🔄 AI component generation system (OpenAI integration)
6. 🔄 Dashboard and visual editor UI
7. 🔄 Component library with vector search
8. 🔄 Payment integration (Razorpay/Stripe)
9. 🔄 Deployment system and subdomain management

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License
Private project - All rights reserved
