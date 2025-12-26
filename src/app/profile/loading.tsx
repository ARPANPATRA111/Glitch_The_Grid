import { ProfileSkeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse hidden md:block" />
              <div className="h-9 w-9 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-28 rounded bg-muted animate-pulse" />
        </div>
        
        <ProfileSkeleton />
      </main>
    </div>
  );
}
