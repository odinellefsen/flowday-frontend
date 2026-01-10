'use client';

import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <WifiOff className="h-24 w-24 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">You&apos;re Offline</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          It looks like you&apos;ve lost your internet connection. Some features may not be available.
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
