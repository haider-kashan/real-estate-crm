// app/lib/utils.ts

export const parsePrice = (priceStr: string | undefined): number => {
  if (!priceStr) return 0;
  
  // Clean up string: remove commas, dashes, and extra spaces
  // If it's a range like "45k - 50k", we grab the first part "45k"
  let cleanStr = priceStr.toLowerCase().replace(/,/g, '').split('-')[0].trim();
  
  let multiplier = 1;
  
  if (cleanStr.includes('crore') || cleanStr.includes('cr')) {
    multiplier = 10000000;
    cleanStr = cleanStr.replace('crore', '').replace('cr', '');
  } else if (cleanStr.includes('lac') || cleanStr.includes('lakh')) {
    multiplier = 100000;
    cleanStr = cleanStr.replace('lac', '').replace('lakh', '');
  } else if (cleanStr.includes('k')) {
    multiplier = 1000;
    cleanStr = cleanStr.replace('k', '');
  }
  
  const numberPart = parseFloat(cleanStr);
  return isNaN(numberPart) ? 0 : numberPart * multiplier;
};