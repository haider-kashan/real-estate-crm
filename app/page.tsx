import { getLeads } from './actions';
import LeadDashboard from './components/LeadDashboard';
import { ReminderItem } from './components/HeaderBar';
import { auth } from '../auth'; // <--- 1. Import Auth

// Helper to generate reminders
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

export default async function Home() {
  
  // 2. Fetch User Session
  const session = await auth();
  const user = session?.user 
    ? { name: session.user.name || 'User', email: session.user.email || '' } 
    : undefined;

  // 3. Fetch REAL data from Supabase
  const leads = await getLeads(); 

  // 4. Generate reminders
  const myReminders = getReminders(leads);

  return (
    <LeadDashboard 
      title="Real Estate CRM" 
      initialData={leads} 
      department="all" 
      reminders={myReminders}
      user={user} // <--- 5. Pass User to Dashboard
    />
  );
}