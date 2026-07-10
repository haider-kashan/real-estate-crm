// app/lib/dummy-data.ts

export const demoLeads = [
  // 1. BUYER - HOUSE - NEGOTIATION (Active Deal)
  {
    leadInfo: {
      name: 'Sarah Jenkins',
      phone: '+1 555 0192',
      whatsapp: '+1 555 0192',
      location: 'DHA Phase 6',
      type: 'buyer',
      status: 'negotiation',
      propertyType: 'House',
      budget: '45000000',
      bedrooms: '5',
      bathrooms: '6',
      hasBasement: true,
      isCorner: false,
    },
    logs: [
      { content: 'Initial call. Looking for a modern 5-bed house.', type: 'call', date: new Date(Date.now() - 5 * 86400000) },
      { content: 'Showed them 3 properties. Very interested in the one on Street 12.', type: 'meeting', date: new Date(Date.now() - 2 * 86400000) },
      { content: 'They made an offer of 43 Million. Negotiating with the owner.', type: 'whatsapp', date: new Date() }
    ],
    invoices: []
  },

  // 2. SELLER - PLOT - CLOSED (Successful Sale)
  {
    leadInfo: {
      name: 'Ahmed Khan',
      phone: '+92 300 1122334',
      location: 'Bahria Town Sector C',
      type: 'seller',
      status: 'closed',
      propertyType: 'Plot',
      size: '10 Marla',
      demand: '12000000',
      isParkFacing: true,
    },
    logs: [
      { content: 'Listed 10 Marla park-facing plot.', type: 'meeting', date: new Date(Date.now() - 30 * 86400000) },
      { content: 'Deal finalized at 11.5M. Token received.', type: 'meeting', date: new Date(Date.now() - 5 * 86400000) }
    ],
    invoices: [
      { amount: 115000, status: 'paid', dueDate: new Date(Date.now() - 2 * 86400000), details: { description: '1% Agency Commission' } }
    ]
  },

  // 3. TENANT - FLAT - NEW (Fresh Lead)
  {
    leadInfo: {
      name: 'Maria Garcia',
      phone: '+44 7911 123456',
      whatsapp: '+44 7911 123456',
      location: 'Blue Area',
      type: 'tenant',
      status: 'new',
      propertyType: 'Flat',
      budget: '80000',
      bedrooms: '2',
    },
    logs: [
      { content: 'Lead generated from website. Wants a 2-bed apartment near the metro.', type: 'system', date: new Date() }
    ],
    invoices: []
  },

  // 4. LANDLORD - COMMERCIAL - INTERESTED (Warm Lead)
  {
    leadInfo: {
      name: 'Rohan Sharma',
      phone: '+971 50 123 4567',
      location: 'F-7 Markaz',
      type: 'landlord',
      status: 'interested',
      propertyType: 'Commercial',
      size: '2000 sqft',
      demand: '500000',
      isMainRoad: true,
    },
    logs: [
      { content: 'Wants to rent out the ground floor shop. High foot traffic.', type: 'call', date: new Date(Date.now() - 10 * 86400000) },
      { content: 'Sent him market analysis for F-7 rentals.', type: 'email', date: new Date(Date.now() - 1 * 86400000) }
    ],
    invoices: []
  },

  // 5. BUYER - PORTION - CONTACTED (Follow-up needed)
  {
    leadInfo: {
      name: 'David Chen',
      phone: '+1 416 555 0198',
      whatsapp: '+1 416 555 0198',
      location: 'G-10/4',
      type: 'buyer',
      status: 'contacted',
      propertyType: 'Portion',
      budget: '15000000',
      floors: '1',
      bedrooms: '3',
    },
    logs: [
      { content: 'Looking for an upper portion. Needs separate entrance.', type: 'whatsapp', date: new Date(Date.now() - 3 * 86400000) }
    ],
    invoices: []
  },

  // 6. SELLER - HOUSE - DEAD (Lost Deal)
  {
    leadInfo: {
      name: 'Fatima Ali',
      phone: '+92 333 9988776',
      location: 'E-7',
      type: 'seller',
      status: 'dead',
      propertyType: 'House',
      demand: '150000000',
      bedrooms: '6',
      hasServantQuarter: true,
      isCorner: true,
    },
    logs: [
      { content: 'Seller is demanding way above market rate. Refuses to negotiate.', type: 'meeting', date: new Date(Date.now() - 15 * 86400000) },
      { content: 'Dropped the listing. Unrealistic expectations.', type: 'system', date: new Date(Date.now() - 2 * 86400000) }
    ],
    invoices: []
  },

  // 7. TENANT - HOUSE - CLOSED (Successful Rental)
  {
    leadInfo: {
      name: 'Omar Tariq',
      phone: '+92 321 4455667',
      location: 'F-11/2',
      type: 'tenant',
      status: 'closed',
      propertyType: 'House',
      budget: '250000',
      bedrooms: '4',
    },
    logs: [
      { content: 'Family moving from Lahore. Needed house urgently.', type: 'call', date: new Date(Date.now() - 12 * 86400000) },
      { content: 'Rental agreement signed. Keys handed over.', type: 'meeting', date: new Date(Date.now() - 1 * 86400000) }
    ],
    invoices: [
      { amount: 125000, status: 'paid', dueDate: new Date(), details: { description: 'Half month rent (Agency Fee)' } }
    ]
  },

  // 8. LANDLORD - FLAT - NEGOTIATION (Pending Payment)
  {
    leadInfo: {
      name: 'Jessica Taylor',
      phone: '+44 7700 900123',
      whatsapp: '+44 7700 900123',
      location: 'Centaurus Apartments',
      type: 'landlord',
      status: 'negotiation',
      propertyType: 'Flat',
      demand: '180000',
      bedrooms: '3',
      bathrooms: '3',
    },
    logs: [
      { content: 'Found an expat tenant. Negotiating furnishing details.', type: 'whatsapp', date: new Date(Date.now() - 2 * 86400000) }
    ],
    invoices: [
      { amount: 90000, status: 'pending', dueDate: new Date(Date.now() + 3 * 86400000), details: { description: 'Advance Commission Invoice' } }
    ]
  }
];