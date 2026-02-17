# Flowday Frontend

A modern, mobile-first daily task scheduler built with Next.js, TanStack Query,
and shadcn/ui components. This frontend connects to the Daily Scheduler API to
help users manage their daily tasks, meals, and habits.

## Features

- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Authentication**: Secure authentication using Clerk
- **Task Management**: View today's tasks with smart categorization
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ⚡ **Real-time Updates**: Powered by TanStack Query for efficient data
  fetching
- **Dark Mode Support**: Automatic light/dark theme switching

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A Clerk account for authentication

### Environment Setup

1. Copy the environment variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3030
```

2. Install dependencies and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

You can start editing the page by modifying `app/page.tsx`. The page
auto-updates as you edit the file.

This project uses
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to automatically optimize and load [Geist](https://vercel.com/font), a new font
family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out
[the Next.js GitHub repository](https://github.com/vercel/next.js) - your
feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for more details.
