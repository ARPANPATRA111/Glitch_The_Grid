import { SkeletonApplicationCard } from '@/components/ui/skeleton';

export default function ApplicationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
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
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded bg-muted animate-pulse" />
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2" />
              <div className="h-8 w-12 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Application Cards */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonApplicationCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
