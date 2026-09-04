export interface BranchLocation {
  id: string;
  name: string;
  nameAm?: string;
  address: string;
  addressAm?: string;
  city: string;
  cityAm?: string;
  phone: string;
  hours: string;
  hoursAm?: string;
  is24Hours: boolean;
  services: string[];
  coordinates: string;
  lat: number;
  lng: number;
}

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: 'ayat',
    name: 'Ayat Branch',
    nameAm: 'አያት ቅርንጫፍ',
    address: 'Ayat Zone 2, Main Road',
    addressAm: 'አያት ዞን 2፣ ዋና መንገድ',
    city: 'Addis Ababa',
    cityAm: 'አዲስ አበባ',
    phone: '+251 116 889 900',
    hours: '24 Hours',
    hoursAm: '24 ሰዓት ክፍት',
    is24Hours: true,
    services: ['Prescription', 'Consultation', 'Delivery Pickup', 'Loyalty'],
    coordinates: '9.02, 38.76',
    lat: 9.02,
    lng: 38.76,
  },
  {
    id: 'adama',
    name: 'Adama Branch',
    nameAm: 'አዳማ ቅርንጫፍ',
    address: 'Bole Road, Near Adama Stadium',
    addressAm: 'ቦሌ መንገድ፣ አዳማ ስታዲየም አጠገብ',
    city: 'Adama',
    cityAm: 'አዳማ',
    phone: '+251 221 112 233',
    hours: '8:00 AM - 10:00 PM',
    hoursAm: 'ከጠዋቱ 2:00 - ማታ 4:00',
    is24Hours: false,
    services: ['Prescription', 'Consultation', 'Delivery'],
    coordinates: '8.54, 39.27',
    lat: 8.54,
    lng: 39.27,
  },
  {
    id: 'bethel',
    name: 'Bethel Branch',
    nameAm: 'ቤቴል ቅርንጫፍ',
    address: 'Bethel Hospital Street',
    addressAm: 'ቤቴል ሆስፒታል መንገድ',
    city: 'Addis Ababa',
    cityAm: 'አዲስ አበባ',
    phone: '+251 113 445 566',
    hours: '8:00 AM - 9:00 PM',
    hoursAm: 'ከጠዋቱ 2:00 - ማታ 3:00',
    is24Hours: false,
    services: ['Prescription', 'Consultation', 'Loyalty'],
    coordinates: '9.01, 38.74',
    lat: 9.01,
    lng: 38.74,
  },
  {
    id: 'dire-dawa',
    name: 'Dire Dawa Branch',
    nameAm: 'ድሬዳዋ ቅርንጫፍ',
    address: 'Kezira, Opposite Train Station',
    addressAm: 'ከዚራ፣ ባቡር ጣቢያ ፊት ለፊት',
    city: 'Dire Dawa',
    cityAm: 'ድሬዳዋ',
    phone: '+251 251 112 244',
    hours: '8:00 AM - 10:00 PM',
    hoursAm: 'ከጠዋቱ 2:00 - ማታ 4:00',
    is24Hours: false,
    services: ['Prescription', 'Delivery Pickup'],
    coordinates: '9.60, 41.85',
    lat: 9.60,
    lng: 41.85,
  },
  {
    id: 'figa',
    name: 'Figa Branch',
    nameAm: 'ፊጋ ቅርንጫፍ',
    address: 'Figa Junction, Next to Commercial Bank',
    addressAm: 'ፊጋ መገንጠያ፣ ንግድ ባንክ ጎን',
    city: 'Addis Ababa',
    cityAm: 'አዲስ አበባ',
    phone: '+251 116 334 455',
    hours: '8:00 AM - 11:00 PM',
    hoursAm: 'ከጠዋቱ 2:00 - ማታ 5:00',
    is24Hours: false,
    services: ['Prescription', 'Consultation', 'Delivery'],
    coordinates: '9.03, 38.73',
    lat: 9.03,
    lng: 38.73,
  },
  {
    id: 'hawassa',
    name: 'Hawassa Branch',
    nameAm: 'ሀዋሳ ቅርንጫፍ',
    address: 'Piazza, Near Hawassa University',
    addressAm: 'ፒያሳ፣ ሀዋሳ ዩኒቨርሲቲ አጠገብ',
    city: 'Hawassa',
    cityAm: 'ሀዋሳ',
    phone: '+251 462 223 344',
    hours: '8:00 AM - 10:00 PM',
    hoursAm: 'ከጠዋቱ 2:00 - ማታ 4:00',
    is24Hours: false,
    services: ['Prescription', 'Consultation', 'Delivery', 'Loyalty'],
    coordinates: '7.04, 38.47',
    lat: 7.04,
    lng: 38.47,
  },
  {
    id: 'jemo',
    name: 'Jemo Branch',
    nameAm: 'ጀሞ ቅርንጫፍ',
    address: 'Jemo 1 Condominiums, Block 4',
    addressAm: 'ጀሞ 1 ኮንዶሚኒየም፣ ብሎክ 4',
    city: 'Addis Ababa',
    cityAm: 'አዲስ አበባ',
    phone: '+251 113 889 911',
    hours: '7:00 AM - 11:00 PM',
    hoursAm: 'ከጠዋቱ 1:00 - ማታ 5:00',
    is24Hours: false,
    services: ['Prescription', 'Consultation', 'Delivery', 'Loyalty'],
    coordinates: '9.02, 38.80',
    lat: 9.02,
    lng: 38.80,
  },
];
