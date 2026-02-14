'use client';
import { salesLeads } from '../lib/data';
import LeadDashboard from '../components/LeadDashboard';

export default function SalesPage() {
  return (
    <LeadDashboard 
      title="Sales Dept" 
      initialData={salesLeads} 
      department="sales" 
      tabs={[{ id: 'buyer', label: 'Buyers' }, { id: 'seller', label: 'Sellers' }]} 
    />
  );
}