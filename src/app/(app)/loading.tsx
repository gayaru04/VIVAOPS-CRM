export default function Loading() {
  return (
    <div className="flex flex-col min-h-full animate-pulse">
      {/* Header skeleton */}
      <div className="px-7 pt-[22px] pb-[14px] border-b border-border">
        <div className="h-3 w-20 bg-surface-3 rounded mb-2" />
        <div className="h-6 w-56 bg-surface-3 rounded" />
      </div>
      {/* Content skeleton */}
      <div className="px-7 py-5 flex flex-col gap-3">
        <div className="h-10 bg-surface-3 rounded-lg w-full" />
        <div className="h-10 bg-surface-3 rounded-lg w-full" />
        <div className="h-10 bg-surface-3 rounded-lg w-4/5" />
        <div className="h-10 bg-surface-3 rounded-lg w-3/5" />
      </div>
    </div>
  );
}
