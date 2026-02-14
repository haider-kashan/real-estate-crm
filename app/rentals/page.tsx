'use client';
import { rentalLeads } from '../lib/data';
import LeadDashboard from '../components/LeadDashboard';

export default function RentalsPage() {
  return (
    <LeadDashboard 
      title="Rentals Dept" 
      initialData={rentalLeads} 
      department="rentals" 
      tabs={[{ id: 'tenant', label: 'Tenants' }, { id: 'landlord', label: 'Landlords' }]} 
    />
  );
}