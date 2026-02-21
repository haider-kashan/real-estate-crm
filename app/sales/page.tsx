import React, { Suspense } from 'react';
import { getLeads } from '../actions'; 
import LeadDashboard from '../components/LeadDashboard';

// Custom loader using the blue theme for the Sales department
function DashboardLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default async function SalesPage() {
  // 1. Fetch ALL leads from the database (Server-side)
  const allLeads = await getLeads();

  // 2. Filter to keep ONLY Sales (Buyers & Sellers)
  const salesLeads = allLeads.filter((lead: any) => 
    lead.type === 'buyer' || lead.type === 'seller'
  );

  return (
    // 3. Wrap the client component in Suspense to protect the static build
    <Suspense fallback={<DashboardLoader />}>
      <LeadDashboard 
        title="Sales Dept" 
        initialData={salesLeads} 
        department="sales" 
        tabs={[{ id: 'buyer', label: 'Buyers' }, { id: 'seller', label: 'Sellers' }]} 
      />
    </Suspense>
  );
}
