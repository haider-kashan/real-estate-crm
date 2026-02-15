// app/lib/data.ts

export type Lead = {
  id: number;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  status: 'new' | 'contacted' | 'interested' | 'negotiation' | 'closed' | 'dead';
  
  name: string;
  location: string;
  phone: string;
  whatsapp: string;
  
  budget?: string; 
  demand?: string;
  
  propertyType: 'House' | 'Portion' | 'Flat' | 'Plot' | 'Farmhouse' | 'Commercial';
  size: string;
  bedrooms?: number;
  bathrooms?: number;
  floors?: string;
  
  features: {
    hasBasement: boolean;
    isCorner: boolean;
    isParkFacing: boolean;
    isMainRoad: boolean;
    hasServantQuarter: boolean;
  };
  
  notes: string;
  dateAdded: string;
  
  // NEW FIELD: Stores the reminder date
  followUp?: string; // ISO Date String (e.g. "2024-02-14T10:00:00.000Z")
  lastContactDate?: string;
};

export const salesLeads: Lead[] = [
  { 
    id: 1, 
    type: 'buyer', 
    name: "Ali Khan", 
    phone: "0300-1234567", 
    whatsapp: "0300-1234567",
    budget: "3.5 Crore", 
    location: "DHA Phase 6", 
    status: "new",
    propertyType: 'House',
    size: "10 Marla",
    bedrooms: 4,
    bathrooms: 5,
    floors: "Double Story",
    features: { hasBasement: false, isCorner: false, isParkFacing: true, isMainRoad: false, hasServantQuarter: true },
    notes: "Client is an overseas Pakistani.",
    dateAdded: "2024-02-12",
    followUp: new Date().toISOString() // TEST: Sets a reminder for TODAY
  },
  { 
    id: 2, 
    type: 'buyer', 
    name: "Dr. Sameer", 
    phone: "0333-9876543", 
    whatsapp: "0333-9876543",
    budget: "85 Lac", 
    location: "Bahria Town Phase 8", 
    status: "contacted",
    propertyType: 'Plot', 
    size: "7 Marla",
    features: { hasBasement: false, isCorner: true, isParkFacing: false, isMainRoad: false, hasServantQuarter: false },
    notes: "Doctor looking for investment plot.",
    dateAdded: "2024-02-10",
    lastContactDate: "2026-02-11"
  },
  { 
    id: 101, 
    type: 'seller', 
    name: "Kamran Shah", 
    phone: "0345-1111111", 
    whatsapp: "0300-5555123",
    demand: "6.5 Crore", 
    location: "I-8/2", 
    status: "negotiation",
    propertyType: 'House',
    size: "1 Kanal",
    bedrooms: 6,
    bathrooms: 7,
    floors: "Ground + 1",
    features: { hasBasement: true, isCorner: false, isParkFacing: false, isMainRoad: true, hasServantQuarter: true },
    notes: "Owner migrating.",
    dateAdded: "2024-01-20",
    lastContactDate: "2026-02-13",
    followUp: new Date(Date.now() - 86400000).toISOString() // TEST: Sets a reminder for YESTERDAY (Overdue)
  },
  { 
    id: 102, 
    type: 'seller', 
    name: "Tariq Mehmood", 
    phone: "0300-2222222", 
    whatsapp: "0300-2222222",
    demand: "90 Lac", 
    location: "G-13/4", 
    status: "dead",
    propertyType: 'Flat',
    size: "1200 Sqft",
    bedrooms: 2,
    bathrooms: 2,
    floors: "3rd Floor",
    features: { hasBasement: false, isCorner: false, isParkFacing: false, isMainRoad: false, hasServantQuarter: false },
    notes: "Client decided not to sell.",
    lastContactDate: "2026-02-04",
    dateAdded: "2023-12-05"
  }
];

export const rentalLeads: Lead[] = [
  { 
    id: 201, 
    type: 'tenant', 
    name: "Saad Ali", 
    phone: "0300-5556667", 
    whatsapp: "0300-5556667",
    budget: "45k - 50k", 
    location: "I-10 or Near Metro", 
    status: "negotiation",
    propertyType: 'Portion', 
    size: "5-7 Marla",
    bedrooms: 2,
    bathrooms: 2,
    floors: "Upper Portion",
    features: { hasBasement: false, isCorner: false, isParkFacing: false, isMainRoad: false, hasServantQuarter: false },
    notes: "Small family (couple + 1 kid).",
    dateAdded: "2024-02-13",
    lastContactDate: "2026-02-04"
  },
  { 
    id: 202, 
    type: 'tenant', 
    name: "Bilal Khan", 
    phone: "0313-8878350", 
    whatsapp: "0313-8878350",
    budget: "2.5 Lac", 
    location: "F-7", 
    status: "contacted",
    propertyType: 'House',
    size: "1 Kanal",
    bedrooms: 4,
    bathrooms: 5,
    floors: "Full House",
    features: { hasBasement: false, isCorner: true, isParkFacing: true, isMainRoad: false, hasServantQuarter: true },
    notes: "Foreigner client looking for secure area.",
    dateAdded: "2024-02-11",
    lastContactDate: "2026-01-13"
  },
  {
    id: 301,
    type: 'landlord',
    name: "Haji Riaz",
    phone: "0321-1231231",
    whatsapp: "0321-1231231",
    demand: "1.5 Lac",
    location: "F-10/2",
    status: "new",
    propertyType: 'Portion',
    size: "1 Kanal",
    bedrooms: 3,
    bathrooms: 3,
    floors: "Ground Portion",
    features: { hasBasement: false, isCorner: false, isParkFacing: false, isMainRoad: false, hasServantQuarter: true },
    notes: "Strictly small family only.",
    lastContactDate: "2024-01-01",
    dateAdded: "2026-02-13"
  }
];

export const allLeads = [...salesLeads, ...rentalLeads].sort((a, b) => b.id - a.id);