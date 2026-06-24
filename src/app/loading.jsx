// Shown during route segment loads (RSC fetch / suspense). Keeps the brand
// frame stable instead of flashing blank content.
export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Loading</p>
    </div>
  );
}
