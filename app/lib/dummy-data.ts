// app/lib/dummy-data.ts

export const demoLeads = [
  {
    leadInfo: {
      name: 'Kashan',
      phone: '+92 300 1234567',
      whatsapp: '+92 300 1234567',
      location: 'G11, Islamabad',
      type: 'Sale',
      status: 'new',
      propertyType: 'House',
      demand: '150000', 
      bedrooms: '3',
      bathrooms: '3',
      isCorner: true,
      hasServantQuarter: false,
    },
    logs: [
      { content: 'Client inquired about a corner house in G11.', type: 'call' }
    ],
    invoices: []
  },
  {
    leadInfo: {
      name: 'Abdullah',
      phone: '+92 321 7654321',
      whatsapp: '+92 321 7654321',
      location: 'I-8, Islamabad',
      type: 'Sale',
      status: 'negotiation',
      propertyType: 'House',
      demand: '20000000',
      floors: '2',
      hasBasement: true,
      isParkFacing: true,
    },
    logs: [
      { content: 'Sent property pictures via WhatsApp.', type: 'whatsapp' },
      { content: 'Client visited the property. Very interested in the basement.', type: 'meeting' }
    ],
    invoices: [
      { amount: 50000, status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ]
  },
  {
    leadInfo: {
      name: 'Mudassar',
      phone: '+92 333 9998887',
      location: 'Jauharabad',
      type: 'Rent',
      status: 'interested',
      propertyType: 'House',
      budget: '200000', 
      isMainRoad: true,
    },
    logs: [
      { content: 'Looking for a main road rental for commercial use.', type: 'call' }
    ],
    invoices: []
  }
];