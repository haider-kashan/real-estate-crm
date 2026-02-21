import React, { Suspense } from 'react';
import { getLeads } from '../actions'; 
import LeadDashboard from '../components/LeadDashboard';

// A clean loading fallback to display while the client-side hooks initialize
function DashboardLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export default async function RentalsPage() {
  // 1. Fetch ALL leads from the database (Server-side)
  const allLeads = await getLeads();

  // 2. Filter to keep ONLY Rentals (Tenants & Landlords)
  const rentalLeads = allLeads.filter((lead: any) => 
    lead.type === 'tenant' || lead.type === 'landlord'
  );

  return (
    // 3. Wrap the client component in Suspense to protect the static build
    <Suspense fallback={<DashboardLoader />}>
      <LeadDashboard 
        title="Rentals Dept" 
        initialData={rentalLeads} 
        department="rentals" 
        tabs={[{ id: 'tenant', label: 'Tenants' }, { id: 'landlord', label: 'Landlords' }]} 
      />
    </Suspense>
  );
}