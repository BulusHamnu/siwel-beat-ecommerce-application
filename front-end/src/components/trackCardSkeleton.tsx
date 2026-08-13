/* Skeleton for track card */
export default function TrackCardSkeleton() {
  return (
    <div className="animate-pulse border border-blue-300 rounded-md p-2 max-w-100 w-full h-120 flex flex-col justify-between place-self-center">
      <div className="h-64 bg-slate-700 rounded" />

      <div className="p-3 flex flex-col">
        <div className="h-6 w-2/3 bg-slate-700 rounded mt-4" />

        <div className="h-4 w-1/3 bg-slate-700 rounded mt-3" />

        <div className="h-4 w-3/4 bg-slate-700 rounded mt-2" />

        <div className="my-5 bg-slate-700 h-11.25 " />
      </div>
    </div>
  );
}
