export const parsePrice = (priceStr: string) => {
  if (!priceStr) return 0;
  const clean = priceStr.toLowerCase().replace(/,/g, '');
  if (clean.includes('crore')) return parseFloat(clean) * 10000000;
  if (clean.includes('lac') || clean.includes('lakh')) return parseFloat(clean) * 100000;
  if (clean.includes('k')) return parseFloat(clean) * 1000;
  return parseFloat(clean.replace(/[^0-9.]/g, '')) || 0;
};

// --- FIXED HEALTH LOGIC ---
export const getLeadHealth = (lastContactDate?: string, dateAdded?: string) => {
  // Priority: 1. Last Contact, 2. Date Added, 3. Fallback to Today (Only if NEW)
  let targetDateStr = lastContactDate;
  
  if (!targetDateStr) {
    targetDateStr = dateAdded;
  }

  // If we STILL have no date (rare), treat as new (Healthy)
  if (!targetDateStr) {
    return { status: 'Healthy', color: 'bg-green-500', text: 'text-green-600', bgText: 'bg-green-50', score: 100, days: 0 };
  }

  const targetDate = new Date(targetDateStr);
  const now = new Date();
  
  // Calculate difference in Days
  const diffTime = Math.abs(now.getTime() - targetDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

  // LOGIC: 
  // 0-7 Days: Healthy
  // 8-14 Days: Warning
  // 15+ Days: Critical
  if (diffDays <= 7) {
    return { status: 'Healthy', color: 'bg-green-500', text: 'text-green-600', bgText: 'bg-green-50', score: 100, days: diffDays };
  } else if (diffDays <= 14) {
    return { status: 'Warning', color: 'bg-orange-500', text: 'text-orange-600', bgText: 'bg-orange-50', score: 50, days: diffDays };
  } else {
    return { status: 'Critical', color: 'bg-red-600', text: 'text-red-600', bgText: 'bg-red-50', score: 5, days: diffDays };
  }
};