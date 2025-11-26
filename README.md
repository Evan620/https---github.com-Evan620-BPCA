# Building Plan Compliance Analysis SaaS

AI-powered building plan compliance analysis platform built with Next.js, Supabase, and n8n.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd "UILDING PLAN COMPLIANCE ANALYSIS SaaS"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Deployment

### Deploying to Vercel

1. Push your code to GitHub (without `.env.local`)
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploying to Other Platforms

For other platforms (Netlify, Railway, etc.), add the same environment variables in their respective dashboards.

## 🔐 Security Notes

- **Never commit** `.env.local` or any file containing secrets
- The `.env.example` file is safe to commit (contains no real credentials)
- Supabase anon keys are safe to expose in client-side code (they have Row Level Security)
- For production, consider using Supabase's service role key only on the server side

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Workflow**: n8n
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query + Zustand

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── components/
│   ├── auth/            # Auth components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase clients
│   └── utils.ts         # Utility functions
└── types/               # TypeScript types
```

## 🎨 Features

- ✅ Authentication (Login, Signup, Password Reset)
- ✅ Blueprint-style UI design
- ✅ Form validation
- ✅ Responsive design
- 🚧 Dashboard (coming soon)
- 🚧 Project management (coming soon)
- 🚧 AI analysis workflow (coming soon)

## 📝 License

MIT
