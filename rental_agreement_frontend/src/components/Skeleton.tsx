export const CardSkeleton = () => (
  <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden animate-pulse">
    <div className="h-48 bg-white/10" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-white/10 rounded-full" />
        <div className="h-5 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="h-6 w-3/4 bg-white/10 rounded-xl" />
      <div className="h-4 w-1/2 bg-white/10 rounded-xl" />
      <div className="flex justify-between mt-4">
        <div className="h-8 w-20 bg-white/10 rounded-xl" />
        <div className="h-8 w-20 bg-white/10 rounded-xl" />
      </div>
    </div>
  </div>
);

export const PropertyListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-72 bg-white/10 rounded-2xl" />
        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
          <div className="h-4 w-1/2 bg-white/10 rounded-xl" />
          <div className="h-20 bg-white/10 rounded-xl" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <div className="h-8 w-1/2 bg-white/10 rounded-xl" />
          <div className="h-16 bg-white/10 rounded-xl" />
          <div className="h-16 bg-white/10 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);