// app/leads/[id]/loading.tsx

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 z-50 fixed inset-0">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black shadow-sm"></div>
      
      {/* Text */}
      <p className="mt-5 text-sm font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">
        Loading Lead...
      </p>
    </div>
  );
}