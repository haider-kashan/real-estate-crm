import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import HeaderBar from '@/app/components/HeaderBar'; 
import Link from 'next/link';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Re-use your Header */}
      <HeaderBar 
        title="Analytics" 
        subtitle="Performance Overview"
        showBack={true} 
        // @ts-ignore
        user={{ name: session.user.name || 'User', email: session.user.email }}
      />

      <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
        
        {/* Illustration Icon */}
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <span className="text-4xl">📊</span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">Coming Soon</h2>
        
        <p className="text-gray-500 max-w-xs mb-8 leading-relaxed">
          We are building powerful charts to help you track your sales, commissions, and lead growth.
        </p>
        
        <Link href="/" className="mt-8 text-sm font-bold text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

      </div>
    </div>
  );
}