import { getLeads } from '../actions'; // <--- Import from Database
import LeadDashboard from '../components/LeadDashboard';

export default async function SalesPage() {
  // 1. Fetch ALL leads from the database
  const allLeads = await getLeads();

  // 2. Filter to keep ONLY Sales (Buyers & Sellers)
  const salesLeads = allLeads.filter((lead: any) => 
    lead.type === 'buyer' || lead.type === 'seller'
  );

  return (
    <LeadDashboard 
      title="Sales Dept" 
      initialData={salesLeads} // <--- Pass the Real, Filtered Data
      department="sales" 
      tabs={[{ id: 'buyer', label: 'Buyers' }, { id: 'seller', label: 'Sellers' }]} 
    />
  );
}