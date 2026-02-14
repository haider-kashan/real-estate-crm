'use client';

import { allLeads } from './lib/data';
import LeadDashboard from './components/LeadDashboard';
import { ReminderItem } from './components/HeaderBar';

// Helper to generate reminders from leads
const getReminders = (leads: any[]): ReminderItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  // @ts-ignore
  return leads.filter(l => l.followUp).map(l => {
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

export default function Home() {
  const myReminders = getReminders(allLeads);

  return (
    <LeadDashboard 
      title="Real Estate CRM" 
      initialData={allLeads} 
      department="all" 
      reminders={myReminders}
    />
  );
}