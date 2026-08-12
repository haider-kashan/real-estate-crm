import { getLeads } from './actions';
import LeadDashboard from './components/LeadDashboard';
import { ReminderItem } from './components/HeaderBar';
import { auth } from '../auth'; 
import prisma from '@/app/lib/prisma'; // <--- 1. Import Prisma
import LogoutClient from './components/LogoutClient';

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
  
  // 3. Fetch Full User Data from DB (to get the Logo and Demo Status)
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ 
        where: { email: session.user.email },
        select: { name: true, email: true, logoUrl: true, isDemo: true } // Only fetch what we need
      }) 
    : null;

  const user = dbUser 
    ? { 
        name: dbUser.name || 'User', 
        email: dbUser.email || '', 
        logoUrl: dbUser.logoUrl, // <--- 4. Pass the real logo string
        isDemo: dbUser.isDemo
      } 
    : undefined;

  // Catch "Ghost Sessions" (User exists in cookie but was deleted from database)
  if (session?.user && !dbUser) {
    return <LogoutClient />;
  }

  // 5. Fetch REAL leads data
  const leads = await getLeads(); 

  // 6. Generate reminders
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