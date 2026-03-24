import { Skeleton } from '@/components/ui/skeleton';

export default function AccountLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block">
        <div className="sticky top-8 space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, _i) => (
              <Skeleton key={crypto.randomUUID()} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-32" />

        <Skeleton className="h-64 w-full rounded-xl" />

        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
