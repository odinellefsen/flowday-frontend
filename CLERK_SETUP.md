# Clerk.js Authentication Setup

This project has been configured with Clerk.js authentication for Next.js.
Here's what has been set up and how to use it.

## 🚀 What's Been Configured

### 1. Dependencies Installed

- `@clerk/nextjs` - Clerk.js Next.js SDK

### 2. Core Configuration Files

#### Middleware (`middleware.ts`)

- Protects routes like `/dashboard/*` and `/profile/*`
- Automatically redirects unauthenticated users to sign-in
- Handles authentication state across the application

#### Root Layout (`app/layout.tsx`)

- Wrapped with `ClerkProvider` for global authentication context
- Provides authentication state to all components

### 3. Authentication Pages

- `/sign-in/[[...sign-in]]/page.tsx` - Sign-in page with Clerk UI
- `/sign-up/[[...sign-up]]/page.tsx` - Sign-up page with Clerk UI

### 4. Custom Components (`components/auth/`)

- `SignInButton` - Styled sign-in button using your UI components
- `SignUpButton` - Styled sign-up button using your UI components
- `UserButton` - User profile dropdown with account management
- `AuthGuard` - Component to protect content behind authentication

### 5. Example Pages

- **Home Page** (`app/page.tsx`) - Shows different content for
  authenticated/unauthenticated users
- **Dashboard** (`app/dashboard/page.tsx`) - Protected route demonstrating
  middleware protection

## 🔧 Environment Variables Required

You mentioned you already have these in your `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### Optional Environment Variables

```env
# Custom URLs (defaults work for most cases)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🎯 How to Use

### Basic Authentication Hooks

```tsx
"use client";
import { useAuth, useUser } from "@clerk/nextjs";

function MyComponent() {
    const { isSignedIn, userId } = useAuth();
    const { user } = useUser();

    if (!isSignedIn) {
        return <div>Please sign in</div>;
    }

    return <div>Hello {user?.firstName}!</div>;
}
```

### Using Custom Components

```tsx
import { SignInButton, SignUpButton, UserButton, AuthGuard } from '@/components/auth'

// Authentication buttons
<SignInButton />
<SignUpButton />

// User profile button (shows when signed in)
<UserButton />

// Protect content
<AuthGuard>
  <ProtectedContent />
</AuthGuard>
```

### Server-Side Authentication

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function ServerComponent() {
    const { userId } = await auth();

    if (!userId) {
        return <div>Not authenticated</div>;
    }

    return <div>Server-side authenticated content</div>;
}
```

## 🛡️ Protected Routes

Routes matching these patterns are automatically protected by middleware:

- `/dashboard/*` - Dashboard and related pages
- `/profile/*` - User profile pages

To add more protected routes, edit the `isProtectedRoute` matcher in
`middleware.ts`:

```ts
const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/profile(.*)",
    "/admin(.*)", // Add new protected routes here
]);
```

## 🎨 Customization

### Styling Clerk Components

Clerk components can be customized using the `appearance` prop:

```tsx
<UserButton
    appearance={{
        elements: {
            avatarBox: "h-8 w-8",
            userButtonPopoverCard: "shadow-lg",
        },
    }}
/>;
```

### Custom Authentication Flow

You can create completely custom authentication flows using Clerk's headless
hooks:

```tsx
import { useSignIn } from "@clerk/nextjs";

function CustomSignIn() {
    const { signIn, setActive } = useSignIn();

    // Custom sign-in logic here
}
```

## 🚦 Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication Flow:**
   - Visit `http://localhost:3000` - Should show sign-in/sign-up buttons
   - Click "Sign Up" to create an account
   - After signing up, you should see the authenticated home page
   - Visit `http://localhost:3000/dashboard` - Should show the protected
     dashboard
   - Try accessing `/dashboard` in an incognito window - Should redirect to
     sign-in

3. **Test Protected Routes:**
   - Sign out and try to access `/dashboard` directly
   - Should be redirected to the sign-in page

## 📚 Next Steps

1. **Customize the UI** - Update the authentication components to match your
   design system
2. **Add User Roles** - Implement role-based access control using Clerk's
   organization features
3. **Database Integration** - Sync user data with your database using Clerk
   webhooks
4. **Social Logins** - Enable Google, GitHub, etc. in your Clerk dashboard
5. **Multi-factor Authentication** - Enable MFA in your Clerk dashboard settings

## 🔗 Useful Links

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Dashboard](https://dashboard.clerk.com/)

## 🐛 Troubleshooting

**Common Issues:**

1. **Environment variables not working** - Make sure they start with
   `NEXT_PUBLIC_` for client-side access
2. **Middleware not protecting routes** - Check the route patterns in
   `middleware.ts`
3. **Hydration errors** - Make sure to use `'use client'` directive for
   components using Clerk hooks

Your Clerk.js authentication is now fully set up and ready to use! 🎉
