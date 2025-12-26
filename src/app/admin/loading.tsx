export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              <div className="space-y-1">
                <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded bg-muted animate-pulse" />
              <div className="h-9 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 rounded bg-muted animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-7 w-10 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-muted animate-pulse mb-4" />
              <div className="h-5 w-32 rounded bg-muted animate-pulse mb-2" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Recent Activity Section */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6 border-b">
            <div className="h-6 w-36 rounded bg-muted animate-pulse mb-1" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
