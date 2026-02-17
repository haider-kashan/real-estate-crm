import { getLeads } from '../actions'; // <--- Import from Database
import LeadDashboard from '../components/LeadDashboard';

export default async function RentalsPage() {
  // 1. Fetch ALL leads from the database
  const allLeads = await getLeads();

  // 2. Filter to keep ONLY Rentals (Tenants & Landlords)
  // We do this here so the Rentals Dashboard doesn't show Buyers/Sellers
  const rentalLeads = allLeads.filter((lead: any) => 
    lead.type === 'tenant' || lead.type === 'landlord'
  );

  return (
    <LeadDashboard 
      title="Rentals Dept" 
      initialData={rentalLeads} // <--- Pass the Real, Filtered Data
      department="rentals" 
      tabs={[{ id: 'tenant', label: 'Tenants' }, { id: 'landlord', label: 'Landlords' }]} 
    />
  );
}