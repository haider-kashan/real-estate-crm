// app/leads/[id]/page.tsx
import { getLead, getLeads } from '../../actions';
import LeadClient from './LeadClient';

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // The server fetches the data instantly before the user even sees the screen
  const dbLead = await getLead(parseInt(id));
  const allLeads = await getLeads();

  // Pass the data to your existing UI
  return <LeadClient dbLead={dbLead} allLeads={allLeads} />;
}