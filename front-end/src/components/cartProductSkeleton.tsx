/* Cart Product Skeleton */
export default function CartProductSkeleton() {
  return (
    <div className="bg-[#6EACDA]/10 grid grid-cols-1 sm:grid-cols-[230px_auto] sm:gap-4 md:gap-5 h-fit p-5 animate-pulse">
      {/* ----- */}
      <div className="max-h-75 min-h-52 w-full border border-gray-400 overflow-hidden bg-[#4f79b8]/30 aspect-square sm:aspect-auto">
        <div className="w-full h-full grid place-items-center">
          <div className="w-12 h-12 rounded-full bg-white/20" />
        </div>
      </div>
      {/* ------ */}
      <div className="text-left mt-6 w-full">
        <div className="flex justify-between gap-2 mb-3">
          <div className="h-7 w-40 rounded bg-[#4f79b8]/40" />
          <div className="h-5 w-5 rounded-sm bg-[#4f79b8]/40 shrink-0" />
        </div>

        {/* ----- */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <div className="h-5 w-20 rounded bg-[#4f79b8]/40" />
              <div className="h-5 w-14 rounded bg-[#4f79b8]/30" />
            </div>

            <div className="flex gap-2 items-center">
              <div className="h-5 w-12 rounded bg-[#4f79b8]/40" />
              <div className="h-5 w-14 rounded bg-[#4f79b8]/30" />
            </div>

            <div className="flex gap-2 items-center">
              <div className="h-5 w-12 rounded bg-[#4f79b8]/40" />
              <div className="h-5 w-14 rounded bg-[#4f79b8]/30" />
            </div>
          </div>

          <div className="h-10 w-24 rounded bg-red-600/40 ml-4 shrink-0" />
        </div>
      </div>
    </div>
  );
}
