/**
 * Michu Pharmacy - Physical Branch Seed Configuration
 * 
 * IMPORTANT:
 * The latitude and longitude values below are temporary placeholders for development.
 * Replace with verified production GPS coordinates before final deployment.
 */

export interface BranchSeedData {
  id: number;
  name: string;
  code: string;
  city: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  isPlaceholderCoords: boolean;
  status: 'active' | 'inactive';
}

export const SEED_BRANCHES: BranchSeedData[] = [
  {
    id: 1,
    name: 'Ayat Branch',
    code: 'AYAT-01',
    city: 'Addis Ababa',
    location: 'Ayat Zone 3, Near Ayat Roundabout',
    address: 'Ayat Square Commercial Complex, Ground Floor, Addis Ababa',
    phone: '+251-911-010-001',
    email: 'ayat@michupharmacy.com',
    manager: 'Sr. Tigist Mengistu',
    openingHours: '24 Hours (Daily)',
    latitude: 9.0125, // Temporary placeholder
    longitude: 38.8654, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 2,
    name: 'Adama Branch',
    code: 'ADM-02',
    city: 'Adama',
    location: 'Adama Post Office Area, Main Highway',
    address: 'Bole Area, Opposite Central Mall, Adama',
    phone: '+251-911-020-002',
    email: 'adama@michupharmacy.com',
    manager: 'Ato Daniel Bekele',
    openingHours: '8:00 AM - 10:00 PM',
    latitude: 8.5400, // Temporary placeholder
    longitude: 39.2700, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 3,
    name: 'Bethel Branch',
    code: 'BTH-03',
    city: 'Addis Ababa',
    location: 'Kolfe Keranio / Bethel Hospital Area',
    address: 'Bethel Hospital Main Gate Road, Addis Ababa',
    phone: '+251-911-030-003',
    email: 'bethel@michupharmacy.com',
    manager: 'Sr. Hiwot Lemma',
    openingHours: '8:00 AM - 9:00 PM',
    latitude: 9.0010, // Temporary placeholder
    longitude: 38.7050, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 4,
    name: 'Dire Dawa Branch',
    code: 'DD-04',
    city: 'Dire Dawa',
    location: 'Kezira Commercial Zone',
    address: 'Kezira Street, Near Ras Hotel, Dire Dawa',
    phone: '+251-911-040-004',
    email: 'diredawa@michupharmacy.com',
    manager: 'Ato Yonas Fekadu',
    openingHours: '8:00 AM - 9:30 PM',
    latitude: 9.6000, // Temporary placeholder
    longitude: 41.8600, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 5,
    name: 'Figa Branch',
    code: 'FIG-05',
    city: 'Addis Ababa',
    location: 'Yeka / Figa Mazoriya',
    address: 'Figa Roundabout Commercial Center, Addis Ababa',
    phone: '+251-911-050-005',
    email: 'figa@michupharmacy.com',
    manager: 'Dr. Selamawit Tadesse',
    openingHours: '8:00 AM - 10:00 PM',
    latitude: 9.0280, // Temporary placeholder
    longitude: 38.8250, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 6,
    name: 'Hawassa Branch',
    code: 'HAW-06',
    city: 'Hawassa',
    location: 'Piazza / Menhariya Zone',
    address: 'Hawassa Main Avenue, Near Referral Hospital, Hawassa',
    phone: '+251-911-060-006',
    email: 'hawassa@michupharmacy.com',
    manager: 'Ato Mesfin Alemu',
    openingHours: '8:00 AM - 10:00 PM',
    latitude: 7.0500, // Temporary placeholder
    longitude: 38.4800, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 7,
    name: 'Jemo Branch',
    code: 'JEM-07',
    city: 'Addis Ababa',
    location: 'Jemo 1 Commercial Strip',
    address: 'Jemo 1 Main Road, Near Glass Factory, Addis Ababa',
    phone: '+251-911-070-007',
    email: 'jemo@michupharmacy.com',
    manager: 'Sr. Rahel Girma',
    openingHours: '8:00 AM - 10:00 PM',
    latitude: 8.9550, // Temporary placeholder
    longitude: 38.7180, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
  {
    id: 8,
    name: 'Bole Branch',
    code: 'BOL-08',
    city: 'Addis Ababa',
    location: 'Bole Medhanialem Commercial Zone',
    address: 'Bole Road, Near Medhanialem Cathedral, Addis Ababa',
    phone: '+251-11-123-4567',
    email: 'bole@michupharmacy.com',
    manager: 'Ato Kebede Tesfaye',
    openingHours: '8:00 AM - 11:00 PM',
    latitude: 8.9950, // Temporary placeholder
    longitude: 38.7890, // Temporary placeholder
    isPlaceholderCoords: true,
    status: 'active',
  },
];
