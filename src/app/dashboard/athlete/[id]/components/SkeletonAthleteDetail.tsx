import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for athlete details while data is loading.
 */
const SkeletonAthleteDetail = () => {
  return (
    <div className="min-h-screen bg-muted pt-16">
      <div className="border-b border-border bg-card p-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SkeletonAthleteDetail;
