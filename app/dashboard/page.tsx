import { getLeads } from '../actions';
import LeadDashboard from '../components/LeadDashboard';
import { ReminderItem } from '../components/HeaderBar';
import { requireDbUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

// Helper to generate reminders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReminders = (leads: any[]): ReminderItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default async function DashboardPage() {
  const dbUser = await requireDbUser();

  if (!dbUser) {
    redirect('/login');
  }

  const user = {
    name: dbUser.name || 'User',
    email: dbUser.email || '',
    logoUrl: dbUser.logoUrl,
    isDemo: dbUser.isDemo,
  };

  // Fetch REAL leads data
  const leads = await getLeads();

  // Generate reminders
  const myReminders = getReminders(leads);

  return (
    <LeadDashboard
      title="EstatePulse"
      initialData={leads}
      department="all"
      reminders={myReminders}
      user={user}
    />
  );
}
