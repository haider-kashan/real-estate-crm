export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
    </div>
  );
}