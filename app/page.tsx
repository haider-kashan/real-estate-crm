import { getLeads } from './actions'; // <--- Import from the Bridge
import LeadDashboard from './components/LeadDashboard';
import { ReminderItem } from './components/HeaderBar';

// Helper to generate reminders (Same logic as before)
const getReminders = (leads: any[]): ReminderItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return leads.filter((l) => l.followUp).map((l) => {
    const fDate = new Date(l.followUp);
    fDate.setHours(0, 0, 0, 0);

    if (fDate.getTime() < today.getTime()) {
      return { id: l.id, name: l.name, phone: l.phone, type: 'overdue' };
    } else if (fDate.getTime() === today.getTime()) {
      return { id: l.id, name: l.name, phone: l.phone, type: 'today' };
    }
    return null;
  }).filter(Boolean) as ReminderItem[];
};

// 1. Make the function 'async' so it can wait for the Database
export default async function Home() {
  
  // 2. Fetch REAL data from Supabase
  const leads = await getLeads(); 

  // 3. Generate reminders from that real data
  const myReminders = getReminders(leads);

  return (
    <LeadDashboard 
      title="Real Estate CRM" 
      initialData={leads} // <--- Pass the Real Data here
      department="all" 
      reminders={myReminders}
    />
  );
}