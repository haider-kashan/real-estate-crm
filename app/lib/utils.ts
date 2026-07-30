export const parsePrice = (priceStr: string) => {
  if (!priceStr) return 0;
  const clean = priceStr.toLowerCase().replace(/,/g, '');
  if (clean.includes('crore')) return parseFloat(clean) * 10000000;
  if (clean.includes('lac') || clean.includes('lakh')) return parseFloat(clean) * 100000;
  if (clean.includes('k')) return parseFloat(clean) * 1000;
  return parseFloat(clean.replace(/[^0-9.]/g, '')) || 0;
};

// --- NUMBER FORMATTING ---
export const formatIndianNumber = (val: string) => {
  // Remove everything except numbers
  const numStr = val.replace(/[^0-9]/g, '');
  if (!numStr) return '';
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const numberToWordsIndian = (val: string) => {
  const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return '';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num.toString()).length > 9) return 'Overflow';
  const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (parseInt(n[1], 10) != 0) ? (a[parseInt(n[1], 10)] || b[parseInt(n[1][0], 10)] + ' ' + a[parseInt(n[1][1], 10)]) + 'Crore ' : '';
  str += (parseInt(n[2], 10) != 0) ? (a[parseInt(n[2], 10)] || b[parseInt(n[2][0], 10)] + ' ' + a[parseInt(n[2][1], 10)]) + 'Lakh ' : '';
  str += (parseInt(n[3], 10) != 0) ? (a[parseInt(n[3], 10)] || b[parseInt(n[3][0], 10)] + ' ' + a[parseInt(n[3][1], 10)]) + 'Thousand ' : '';
  str += (parseInt(n[4], 10) != 0) ? (a[parseInt(n[4], 10)] || b[parseInt(n[4][0], 10)] + ' ' + a[parseInt(n[4][1], 10)]) + 'Hundred ' : '';
  str += (parseInt(n[5], 10) != 0) ? ((str != '') ? 'and ' : '') + (a[parseInt(n[5], 10)] || b[parseInt(n[5][0], 10)] + ' ' + a[parseInt(n[5][1], 10)]) : '';

  return str.trim() + ' Only';
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

// --- SMART MATCH ENGINE ---
export const findLeadMatches = (lead: any, allLeads: any[]) => {
  if (!lead || !allLeads || allLeads.length === 0) return [];

  // Determine Target Type
  let targetType = '';
  if (lead.type === 'tenant') targetType = 'landlord';
  else if (lead.type === 'landlord') targetType = 'tenant';
  else if (lead.type === 'buyer') targetType = 'seller';
  else if (lead.type === 'seller') targetType = 'buyer';

  if (!targetType) return [];

  const sourcePrice = parsePrice(lead.budget || lead.demand || '0');
  const sourceLocation = lead.location?.toLowerCase().trim() || '';
  const sourcePropType = lead.propertyType?.toLowerCase().trim() || '';

  const matches: { match: any; reason: string }[] = [];

  allLeads.forEach(target => {
    if (target.id === lead.id) return;
    if (target.type !== targetType) return;
    // Don't match closed or dead leads
    if (['dead', 'closed'].includes(target.status)) return;

    const targetPrice = parsePrice(target.budget || target.demand || '0');
    const targetLocation = target.location?.toLowerCase().trim() || '';
    const targetPropType = target.propertyType?.toLowerCase().trim() || '';

    const reasons = [];

    // Location Check (fuzzy overlap)
    let locationMatch = false;
    if (sourceLocation && targetLocation) {
       if (sourceLocation.includes(targetLocation) || targetLocation.includes(sourceLocation)) {
           locationMatch = true;
           reasons.push("Location");
       }
    }

    // Property Type Check
    let propTypeMatch = false;
    if (sourcePropType && targetPropType) {
        if (sourcePropType === targetPropType) {
            propTypeMatch = true;
            reasons.push("Property Type");
        }
    }

    // Price Check (+/- 15% Negotiation Margin)
    let priceMatch = false;
    if (sourcePrice > 0 && targetPrice > 0) {
       const lowerBound = sourcePrice * 0.85;
       const upperBound = sourcePrice * 1.15;
       if (targetPrice >= lowerBound && targetPrice <= upperBound) {
           priceMatch = true;
           reasons.push("Price (15% margin)");
       }
    }

    // Determine if it's a solid match
    if (locationMatch || propTypeMatch || priceMatch) {
       // Must match at least two criteria, OR match Location explicitly
       if ((locationMatch && priceMatch) || (locationMatch && propTypeMatch) || (propTypeMatch && priceMatch) || locationMatch) {
         matches.push({
            match: target,
            reason: reasons.join(" + ") || "Similar Area"
         });
       }
    }
  });

  // Sort by best matches first (most reasons)
  return matches.sort((a, b) => b.reason.length - a.reason.length);
};