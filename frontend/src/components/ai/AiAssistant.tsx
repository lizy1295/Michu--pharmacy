'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage, Language } from '@/context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; url: string; icon?: string }[];
  badge?: string;
}

const KNOWLEDGE_RESPONSES: Record<string, Record<Language, { text: string; links?: { label: string; url: string; icon?: string }[] }>> = {
  paracetamol: {
    en: {
      text: '💊 **Paracetamol (Acetaminophen) Guide**:\n• **Usage**: Relief of mild-to-moderate pain (headaches, muscle aches, toothaches) and fever reduction.\n• **Dosage**: 500mg – 1000mg (1-2 tablets) every 4 to 6 hours as needed. Maximum 4,000mg (4g) per 24 hours.\n• **Safety Alert**: Do not combine with other paracetamol products to avoid serious liver injury. Avoid alcohol consumption.',
      links: [
        { label: 'View in Drug Database', url: '/health?action=drug-info', icon: '📖' },
        { label: 'Consult a Pharmacist', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    },
    am: {
      text: '💊 **የፓራሲታሞል (Paracetamol) መመሪያ**:\n• **ጥቅም**: ቀላል እና መካከለኛ የራስ፣ የጥርስ፣ የጡንቻ ህመሞች እና ትኩሳትን ለመቀነስ።\n• **የመውሰጃ መጠን**: 500ሚግ - 1000ሚግ (1-2 እንክብል) በየ 4 እስከ 6 ሰዓት ልዩነት። በቀን ከ 4000ሚግ (8 እንክብል) መብለጥ የለበትም።\n• **ማስጠንቀቂያ**: የጉበት ጉዳትን ለመከላከል ከሌሎች ፓራሲታሞል ካላቸው መድኃኒቶች ጋር በአንድ ላይ አይውሰዱ። ከአልኮል መጠጥ ይቆጠቡ።',
      links: [
        { label: 'በመድሃኒት ዳታቤዝ ይመልከቱ', url: '/health?action=drug-info', icon: '📖' },
        { label: 'ከፋርማሲስት ጋር ይማከሩ', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    },
    ti: {
      text: '💊 **መምርሒ ፓራሲታሞል (Paracetamol)**:\n• **ጥቕሚ**: ፈኩስን ማእከላይን ናይ ርእሲ፣ ስኒ፣ ጭዋዳ ቃንዛን ረስንን ንምቅላል።\n• **መጠን**: 500mg - 1000mg ኣብ ነፍሲ ወከፍ 4 ክሳብ 6 ሰዓታት። ኣብ መዓልቲ ካብ 4000mg ክበልጽ የብሉን።\n• **መጠንቀቕታ**: ጉድኣት ጸላም ከብዲ ንምክልኻል ምስ ካልእ ፓራሲታሞል ዘለዎ መድሃኒት ብሓባር ኣይትውሰዱ።',
      links: [
        { label: 'ኣብ ዳታቤዝ ርኣዩ', url: '/health?action=drug-info', icon: '📖' },
        { label: 'ምስ ፋርማሲስት ተማኸሩ', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    },
    om: {
      text: '💊 **Qajeelfama Paaraasitaamool (Paracetamol)**:\n• **Faayidaa**: Dhukkubbii mataa, ilkaanii, fi qaamaa salphisuuf akkasumas ho\'a qaamaa gadi buusuuf.\n• **Hamma Fudhatamaa**: 500mg - 1000mg (kinini 1-2) sa\'aatii 4-6 gidduutti. Guyyaatti 4000mg ol fudhachuu hin qabdan.\n• **Akeekkachiisa**: Qorichoota biraa Paaraasitaamool of keessaa qaban wajjin walitti hin fudhatinaa.',
      links: [
        { label: 'Kuusaa Qorichaa keessatti ilaalaa', url: '/health?action=drug-info', icon: '📖' },
        { label: 'Ogeessa Faarmasii Mariisisaa', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    },
    af: {
      text: '💊 **Paracetamol Qasbo kee Doolad**:\n• **Taama**: Rasi diwa, sani diwa kee labhat diwa qokoluh.\n• **Qasbo**: 500mg - 1000mg kulli 4-6 saaqat. Ayrok 4000mg gaca manxican.\n• **Akeeko**: Gaba diwa kalih abinnumay.',
      links: [
        { label: 'Diwih Kuusol Wagara', url: '/health?action=drug-info', icon: '📖' },
        { label: 'Pharmacist Wagarissa', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    },
    so: {
      text: '💊 **Hagaha Paracetamol**:\n• **Isticmaalka**: Xanuun baab\'iye fudud (madax xanuun, ilig xanuun) iyo xumad jabin.\n• **Qiyaasta**: 500mg - 1000mg 4-6 saacadood kasta. Ha dhaafin 4000mg 24 saac gudahood.\n• **Digniin**: Ha ku darin daawooyin kale oo paracetamol leh si aad beerkaaga uga ilaaliso waxyeello.',
      links: [
        { label: 'Ka eeg Kaydka Daawada', url: '/health?action=drug-info', icon: '📖' },
        { label: 'La tasho Farmashiistaha', url: '/health?action=consult', icon: '👨‍⚕️' }
      ]
    }
  },
  branches: {
    en: {
      text: '📍 **Michu Pharmacy Branch Network**:\n• **Ayat Branch**: Open **24 Hours / 7 Days** (Ayat Zone 2, Tel: +251 116 889 900)\n• **Adama Branch**: Bole Road, 8:00 AM – 10:00 PM\n• **Bethel Branch**: Bethel Hospital Street, 8:00 AM – 9:00 PM\n• **Dire Dawa Branch**: Kezira, 8:00 AM – 10:00 PM\n• **Figa Branch**: Figa Junction, 8:00 AM – 11:00 PM\n• **Hawassa Branch**: Piazza, 8:00 AM – 10:00 PM\n• **Jemo Branch**: Jemo 1 Condominiums, 7:00 AM – 11:00 PM',
      links: [
        { label: 'View All Branches & Maps', url: '/branches', icon: '📍' },
        { label: 'Upload Rx for Branch Pickup', url: '/health?action=upload', icon: '📸' }
      ]
    },
    am: {
      text: '📍 **የሚቹ ፋርማሲ ቅርንጫፎች**:\n• **አያት ቅርንጫፍ**: **24 ሰዓት ሙሉ ክፍት** (አያት ዞን 2፣ ስልክ: +251 116 889 900)\n• **አዳማ ቅርንጫፍ**: ቦሌ መንገድ (8:00 ጥዋት - 10:00 ማታ)\n• **ቤትኤል ቅርንጫፍ**: ቤትኤል ሆስፒታል አካባቢ (8:00 ጥዋት - 9:00 ማታ)\n• **ድሬዳዋ ቅርንጫፍ**: ከዚራ (8:00 ጥዋት - 10:00 ማታ)\n• **ፊጋ ቅርንጫፍ**: ፊጋ መገናኛ (8:00 ጥዋት - 11:00 ማታ)\n• **ሀዋሳ ቅርንጫፍ**: ፒያሳ (8:00 ጥዋት - 10:00 ማታ)\n• **ጀሞ ቅርንጫፍ**: ጀሞ 1 ኮንዶሚኒየም (7:00 ጥዋት - 11:00 ማታ)',
      links: [
        { label: 'ሁሉንም ቅርንጫፎች ይመልከቱ', url: '/branches', icon: '📍' },
        { label: 'ለቅርንጫፍ ማንሻ ማዘዣ ይስቀሉ', url: '/health?action=upload', icon: '📸' }
      ]
    },
    ti: {
      text: '📍 **ጨናፍር ሚቹ ፋርማሲ**:\n• **ጨንፈር ኣያት**: **24 ሰዓት ሙሉእ ክፍቲ** (ስልኪ: +251 116 889 900)\n• **ጨንፈር ኣዳማ**: መገዲ ቦሌ (8:00 ንግሆ - 10:00 ምሸት)\n• **ጨንፈር ቤትኤል**: ጎደና ሆስፒታል ቤትኤል (8:00 ንግሆ - 9:00 ምሸት)\n• **ጨንፈር ድሬዳዋ**: ከዚራ (8:00 ንግሆ - 10:00 ምሸት)\n• **ጨንፈር ፊጋ**: መገዲ ፊጋ (8:00 ንግሆ - 11:00 ምሸት)\n• **ጨንፈር ሃዋሳ**: ፒያሳ (8:00 ንግሆ - 10:00 ምሸት)\n• **ጨንፈር ጀሞ**: ጀሞ 1 ኮንዶሚኒየም (7:00 ንግሆ - 11:00 ምሸት)',
      links: [
        { label: 'ኩሎም ጨናፍር ርኣዩ', url: '/branches', icon: '📍' }
      ]
    },
    om: {
      text: '📍 **Dameewwan Faarmasii Michuu**:\n• **Damee Aayat**: **Sa\'aatii 24 Banamadha** (Bilbila: +251 116 889 900)\n• **Damee Adaamaa**: Daandii Boolee (8:00 AM - 10:00 PM)\n• **Damee Beet\'eel**: Daandii Hospitaala Beet\'eel (8:00 AM - 9:00 PM)\n• **Damee Dirree Dawaa**: Kaziraa (8:00 AM - 10:00 PM)\n• **Damee Fiigaa**: Fiigaa (8:00 AM - 11:00 PM)\n• **Damee Hawaasaa**: Piyaassaa (8:00 AM - 10:00 PM)\n• **Damee Jemoo**: Jemoo 1 (7:00 AM - 11:00 PM)',
      links: [
        { label: 'Dameewwan Hunda Ilaalaa', url: '/branches', icon: '📍' }
      ]
    },
    af: {
      text: '📍 **Michu Pharmacy Barca**:\n• **Ayat Barca**: **24 Saaqat Fakan** (Tel: +251 116 889 900)\n• **Adama Barca**: Bole gita (8:00 AM - 10:00 PM)\n• **Bethel Barca**: Bethel Hospital gita (8:00 AM - 9:00 PM)\n• **Dire Dawa Barca**: Kezira (8:00 AM - 10:00 PM)',
      links: [
        { label: 'Kulli Barca Wagara', url: '/branches', icon: '📍' }
      ]
    },
    so: {
      text: '📍 **Laamaha Michu Pharmacy**:\n• **Laanta Ayat**: **Furan 24 Saac** (Tel: +251 116 889 900)\n• **Laanta Adama**: Wadada Bole (8:00 AM - 10:00 PM)\n• **Laanta Bethel**: Wadada Isbitaalka Bethel (8:00 AM - 9:00 PM)\n• **Laanta Dire Dawa**: Kezira (8:00 AM - 10:00 PM)',
      links: [
        { label: 'Arag Dhammaan Laamaha', url: '/branches', icon: '📍' }
      ]
    }
  },
  prescription: {
    en: {
      text: '📸 **How Prescription Upload Works at Michu**:\n1. **Capture or Upload**: Take a photo/scan of your doctor\'s prescription.\n2. **Branch Selection**: Choose your closest branch for pick-up.\n3. **Pharmacist Verification**: Our clinical team reviews the Rx within 15-30 minutes.\n4. **SMS Notification**: You receive an SMS when medications are dispensed and ready.\n\n⚠️ *Note: Under Ethiopian health regulations, prescription medications require in-branch pharmacist verification and cannot be delivered by bike/courier.*',
      links: [
        { label: 'Upload Prescription Now', url: '/health?action=upload', icon: '📸' },
        { label: 'View Digital Rx Locker', url: '/account', icon: '📂' }
      ]
    },
    am: {
      text: '📸 **የህክምና ማዘዣ በድረ-ገጽ የመስቀል ሂደት**:\n1. **ማዘዣውን ፎቶ ያንሱ**: የሀኪምዎን ማዘዣ በስልክ ካሜራ ያንሱ ወይም ፒዲኤፍ ይስቀሉ።\n2. **ቅርንጫፍ ይምረጡ**: መድሃኒቱን ለመውሰድ የሚመችዎትን ቅርንጫፍ ይምረጡ።\n3. **የፋርማሲስት ግምገማ**: ባለሙያዎቻችን በ 15-30 ደቂቃ ውስጥ ማዘዣውን ይፈትሻሉ።\n4. **የኤስኤምኤስ (SMS) መልዕክት**: መድኃኒቱ ሲዘጋጅ የጽሁፍ መልዕክት ይደርስዎታል።\n\n⚠️ *ማሳሰቢያ: በኢትዮጵያ የጤና ጥበቃ ደንብ መሰረት የታዘዙ መድሃኒቶች በፋርማሲስት ተረጋግጠው በቅርንጫፍ ብቻ የሚሰጡ ሲሆን የማድረስ አገልግሎት አይሰጥም።*',
      links: [
        { label: 'ማዘዣ አሁኑኑ ይስቀሉ', url: '/health?action=upload', icon: '📸' },
        { label: 'የማዘዣ ማስቀመጫዎን ይመልከቱ', url: '/account', icon: '📂' }
      ]
    },
    ti: {
      text: '📸 **ናይ ሕክምና ትእዛዝ ናይ ምስቃል መስርሕ**:\n1. **ስእሊ ኣልዕሉ**: ናይ ሓኪም ትእዛዝ ስእሊ ኣልዒልኩም ስቐሉ\n2. **ጨንፈር ምረጹ**: መድሃኒት እትወስድሉ ቅርብ ዝበለኩም ጨንፈር ምረጹ\n3. **ምጽዳቕ ፋርማሲስት**: ኣብ ውሽጢ 15-30 ደቒቕ ይረጋገጽ\n4. **መልእኽቲ SMS**: ምስ ተዳለወ ናይ ጽሑፍ መልእኽቲ ይበጽሓኩም\n\n⚠️ *ናይ ሓኪም ትእዛዝ ዘለዎም መድሃኒታት ካብ ጨንፈር ብኣካል ጥራይ ይውሰዱ።*',
      links: [
        { label: 'ትእዛዝ መድሃኒት ስቐሉ', url: '/health?action=upload', icon: '📸' }
      ]
    },
    om: {
      text: '📸 **Ajaja Hakiimii Fe\'uu**:\n1. **Suuraa Kaasaa**: Ajaja hakiimii keessan suuraa kaasaa olkaa\'aa.\n2. **Damee Filadhaa**: Damee isinitti dhihoo ta\'e filadhaa.\n3. **Mirkaneessa Ogeessaa**: Daqiiqaa 15-30 keessatti gamaaggamama.\n4. **Ergaa SMS**: Qorichi yemmuu qophaa\'u SMS n isin gaha.\n\n⚠️ *Qorichootni ajajaan kennaman damee irraa qofa fudhatamu.*',
      links: [
        { label: 'Ajaja Hakiimii Olkaa\'aa', url: '/health?action=upload', icon: '📸' }
      ]
    },
    af: {
      text: '📸 **Diwih Warqata Fakkaciyya**:\n1. **Suura bicisa**: Diwih warqata suura fakkaci.\n2. **Barca doora**: Barcal beeta.\n3. **Pharmacist wagara**: 15-30 daqiqa wagarisa.\n4. **SMS**: Diwa fakateek SMS ruban.',
      links: [
        { label: 'Diwih Warqata Fakkaci', url: '/health?action=upload', icon: '📸' }
      ]
    },
    so: {
      text: '📸 **Habka Soo Gelinta Warqadda Daawada**:\n1. **Sawir qaad**: Sawir ka qaad warqadda dhakhtarka.\n2. **Dooro Laan**: Dooro laanta kuugu dhow.\n3. **Hubinta Farmashiistaha**: Waxaa lagu hubiyaa 15-30 daqiiqo.\n4. **Farriin SMS**: SMS ayaa kuu iman doona marka daawadu diyaar noqoto.',
      links: [
        { label: 'Soo Geli Warqadda Daawada', url: '/health?action=upload', icon: '📸' }
      ]
    }
  },
  consultation: {
    en: {
      text: '👨‍⚕️ **Tele-Health Video Consultation**:\nConnect privately with certified clinical pharmacists and medical specialists to review:\n• Complex medication regimens & potential drug-drug interactions\n• Chronic condition management (diabetes, hypertension, asthma)\n• Skincare & dermatology routines\n\n💡 *Free for Yene Card Loyalty members!*',
      links: [
        { label: 'Schedule Consultation Slot', url: '/health?action=consult', icon: '📅' },
        { label: 'Check Yene Card Status', url: '/account', icon: '💳' }
      ]
    },
    am: {
      text: '👨‍⚕️ **የቴሌ-ሄልዝ የቪዲዮ የህክምና ምክክር**:\nከተመሰከረላቸው ክሊኒካል ፋርማሲስቶች እና የህክምና ባለሙያዎች ጋር በቀጥታ ይገናኙ:\n• የመድሃኒት መስተጋብር እና የጎንዮሽ ጉዳቶች ምርመራ\n• የረጅም ጊዜ ህመሞች (የስኳር፣ የደም ግፊት፣ የአስም) ክትትል\n• የቆዳ እና የውበት እንክብካቤ ምክክር\n\n💡 *ለየኔ ካርድ ባለቤቶች ነፃ ነው!*',
      links: [
        { label: 'የምክክር ቀጠሮ ይያዙ', url: '/health?action=consult', icon: '📅' },
        { label: 'የየኔ ካርድ ሁኔታን ይመልከቱ', url: '/account', icon: '💳' }
      ]
    },
    ti: {
      text: '👨‍⚕️ **ናይ ቪድዮ ሕክምና ምኽሪ (Tele-Health)**:\nምስ ክኢላታት ፋርማሲስት ብቪድዮ ተራኺብኩም ተማኸሩ:\n• መስተጋብር መድሃኒታትን ጎናዊ ሳዕቤናትን\n• ምክትታል ሕዱር ሕማማት (ሽኮርያ፣ ደም ጸቕጢ)\n• ናይ ቆርበትን ውበትን ክንክን\n\n💡 *ንናይ የኔ ካርድ ኣባላት ብነጻ!*',
      links: [
        { label: 'ቆጸራ ምኽሪ ሓዙ', url: '/health?action=consult', icon: '📅' }
      ]
    },
    om: {
      text: '👨‍⚕️ **Maree Viidiyoo Fayyaa**:\nOgeessota Faarmasii fi Hakiimota wajjin kallattiin wal arguun mari\'adhaa:\n• Wal-nyaatinsa qorichaa fi miidhaa cinaa\n• Hordoffii dhibee yeroo dheeraa (sukkaara, dhiibbaa dhiigaa)\n• Kunuunsa gogaa fi bareedinaa\n\n💡 *Abbootii Kaardii Yenee tiif bilisa!*',
      links: [
        { label: 'Beellama Maree Qabadhaa', url: '/health?action=consult', icon: '📅' }
      ]
    },
    af: {
      text: '👨‍⚕️ **Tele-Health Video Wagarissa**:\nPharmacist kee doktoor luk video gicil:\n• Diwih mada kee qokol\n• Sukkar kee dhiibbaa dhiigaa wagarisa\n\n💡 *Yene Card abbaah bilaash!*',
      links: [
        { label: 'Wagarissah Ayro Doora', url: '/health?action=consult', icon: '📅' }
      ]
    },
    so: {
      text: '👨‍⚕️ **La-tashiga Caafimaadka ee Fiidiyowga**:\nKala hadal farmashiistayaasha iyo dhakhaatiirta:\n• Is-dhexgalka daawooyinka iyo dhibaatooyinka\n• Maareynta xanuunada daba dheeraaday (macaanka, dhiig karka)\n• Daryeelka maqaarka\n\n💡 *Bilaash xubnaha Kaarka Yene!*',
      links: [
        { label: 'Qabso Ballan', url: '/health?action=consult', icon: '📅' }
      ]
    }
  },
  payments: {
    en: {
      text: '💳 **Payment Options at Michu Pharmacy**:\n• **Telebirr**: Instant mobile checkout via Telebirr SuperApp and USSD.\n• **CBE Birr & Commercial Bank of Ethiopia**: Direct CBE account transfer.\n• **Cash / POS**: Accepted on-site at all 7 branches for in-store purchases.\n• **Yene Card Points**: Redeem accumulated points for instant product discounts (10 pts = 5 ETB).',
      links: [
        { label: 'Go to Cart & Checkout', url: '/cart', icon: '🛒' },
        { label: 'Browse Products', url: '/products', icon: '🛍️' }
      ]
    },
    am: {
      text: '💳 **የክፍያ አማራጮች በሚቹ ፋርማሲ**:\n• **ቴሌብር (Telebirr)**: በቴሌብር መተግበሪያ ወይም በ USSD ፈጣን ክፍያ\n• **ሲቢኢ ብር (CBE Birr)**: በኢትዮጵያ ንግድ ባንክ በቀጥታ ክፍያ\n• **በጥሬ ገንዘብ ወይም በ POS ማሽን**: በሁሉም 7 ቅርንጫፎቻችን\n• **የየኔ ካርድ ነጥቦች**: ያጠራቀሙትን ነጥብ ወደ ገንዘብ ቅናሽ በመቀየር (10 ነጥብ = 5 ብር)',
      links: [
        { label: 'ወደ ገበያ ቅርጫት ሂድ', url: '/cart', icon: '🛒' },
        { label: 'ምርቶችን ያስሱ', url: '/products', icon: '🛍️' }
      ]
    },
    ti: {
      text: '💳 **ናይ ክፍሊት ኣማራጺታት**:\n• **ቴሌብር (Telebirr)**: ብቀሊሉ ብሞባይል ምኽፋል\n• **ሲቢኢ ብር (CBE Birr)**: ብንግዲ ባንክ ኢትዮጵያ ምኽፋል\n• **ብጥረ ገንዘብ**: ኣብ ኩሎም 7 ጨናፍርና\n• **ነጥብታት የኔ ካርድ**: ነጥብታትኩም ናብ ቅናሽ ቀይሩ',
      links: [
        { label: 'ናብ ቅርጫት ዕዳጋ ኪዱ', url: '/cart', icon: '🛒' }
      ]
    },
    om: {
      text: '💳 **Filannoowwan Kaffaltii**:\n• **Telebirr**: Kaffaltii saffisaa moobaayiliin\n• **CBE Birr**: Baankii Daldala Itoophiyaatiin\n• **Callaadhaan**: Dameewwan hunda keessatti\n• **Qabxii Kaardii Yenee**: Qabxii gara hir\'ina gatiitti jijjiiraa',
      links: [
        { label: 'Gara Gaarii Bittaatti Deemaa', url: '/cart', icon: '🛒' }
      ]
    },
    af: {
      text: '💳 **Gaba Gicil Caagida**:\n• **Telebirr**: Telebirr dalko\n• **CBE Birr**: Commercial Bank of Ethiopia gicil\n• **Yene Card Qabxi**: Qabxik hir\'ina xaaq',
      links: [
        { label: 'Cart fan gila', url: '/cart', icon: '🛒' }
      ]
    },
    so: {
      text: '💳 **Hababka Lacag-bixinta**:\n• **Telebirr**: Lacag-bixin degdeg ah oo taleefanka ah\n• **CBE Birr**: Bangiga Ganacsiga Itoobiya\n• **Kaash**: Dhammaan laamaha\n• **Dhibcaha Kaarka Yene**: Dhibcaha u beddel qiimo dhimis',
      links: [
        { label: 'Tag Gaariga Gadashada', url: '/cart', icon: '🛒' }
      ]
    }
  }
};

export function AiAssistant() {
  const { language, t, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Monitor network connection status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Initialize initial greeting based on active language
  useEffect(() => {
    const greetingText = currentLanguageOption.greeting || 'Hello! How can Michu AI assist your health and medication needs today?';
    setMessages([
      {
        id: 'initial-welcome',
        sender: 'assistant',
        text: greetingText + '\n\n💡 ' + (
          language === 'am' ? 'ስለ መድሃኒት መጠን፣ የህክምና ማዘዣ፣ 24 ሰዓት ክፍት ቅርንጫፎች ወይም ክፍያ መጠየቅ ይችላሉ።' :
          language === 'ti' ? 'ብዛዕባ መጠን መድሃኒት፣ ምስቃል ትእዛዝ መድሃኒት፣ ጨናፍርና ወይ ክፍሊት ሕተቱ።' :
          language === 'om' ? 'Waa\'ee qorichaa, ajaja fe\'uu, dameewwanii fi kaffaltii gaafachuu dandeessu.' :
          language === 'af' ? 'Diwa, diwih warqata, barca kee gicil essera.' :
          language === 'so' ? 'Weydii xaddiga daawada, soo gelinta warqadda, laamaha iyo lacag-bixinta.' :
          'Feel free to ask about drug dosages, prescription uploads, 24/7 branch locations, or Telebirr payments.'
        ),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: [
          { label: language === 'am' ? 'የህክምና ማዘዣ ይስቀሉ' : 'Upload Prescription', url: '/health?action=upload', icon: '📸' },
          { label: language === 'am' ? 'ቅርንጫፎች' : 'Branches', url: '/branches', icon: '📍' },
          { label: language === 'am' ? 'መድሃኒቶችን ያስሱ' : 'Browse Medicines', url: '/products', icon: '💊' }
        ]
      }
    ]);
  }, [language, currentLanguageOption]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(prev => !prev);
    }
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      generateAssistantResponse(text);
    }, 600);
  };

  const generateAssistantResponse = (query: string) => {
    // Offline Handling: Live AI chat requires internet; direct to offline resources
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '⚡ **Offline Mode Active**\n\nLive AI chat and consultation booking require an active internet connection.\n\n✅ **Available Offline**:\n• You can browse all 10 condition guides & symptom assessments offline in the **Symptom Guide**.\n• In an emergency, directly dial **907 / 911** or call **+251 911 965 779**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLinks: [
          { label: 'Browse Symptom Guide Offline', url: '/symptoms', icon: '🩺' },
          { label: 'View Branch Phone Numbers', url: '/branches', icon: '📞' }
        ]
      };
      setIsTyping(false);
      setMessages(prev => [...prev, offlineMessage]);
      return;
    }

    const q = query.toLowerCase();
    let matchKey = '';

    if (q.includes('paracetamol') || q.includes('ፓራሲታሞል') || q.includes('panadol') || q.includes('headache') || q.includes('ራስ ምታት') || q.includes('fever') || q.includes('ትኩሳት') || q.includes('dosage') || q.includes('መጠን')) {
      matchKey = 'paracetamol';
    } else if (q.includes('branch') || q.includes('ቅርንጫፍ') || q.includes('ጨንፈር') || q.includes('damee') || q.includes('barca') || q.includes('laan') || q.includes('24') || q.includes('ayat') || q.includes('adama') || q.includes('location') || q.includes('አድራሻ')) {
      matchKey = 'branches';
    } else if (q.includes('prescription') || q.includes('ማዘዣ') || q.includes('ትእዛዝ') || q.includes('ajaja') || q.includes('warqata') || q.includes('rx') || q.includes('upload') || q.includes('ስቀል') || q.includes('ካሜራ') || q.includes('camera')) {
      matchKey = 'prescription';
    } else if (q.includes('consult') || q.includes('doctor') || q.includes('ዶክተር') || q.includes('ሓኪም') || q.includes('hakiim') || q.includes('ምክክር') || q.includes('video') || q.includes('ቀጠሮ') || q.includes('appointment')) {
      matchKey = 'consultation';
    } else if (q.includes('pay') || q.includes('telebirr') || q.includes('cbe') || q.includes('ቴሌብር') || q.includes('ብር') || q.includes('birr') || q.includes('ክፍያ') || q.includes('kaffaltii') || q.includes('card') || q.includes('yene')) {
      matchKey = 'payments';
    }

    let responseText = '';
    let responseLinks: { label: string; url: string; icon?: string }[] | undefined = undefined;

    if (matchKey && KNOWLEDGE_RESPONSES[matchKey]) {
      const match = KNOWLEDGE_RESPONSES[matchKey][language] || KNOWLEDGE_RESPONSES[matchKey]['en'];
      responseText = match.text;
      responseLinks = match.links;
    } else {
      // General dynamic contextual fallback
      if (language === 'am') {
        responseText = `ስለ **"${query}"** የጠየቁትን ጥያቄ ተቀብያለሁ። ለዝርዝር መረጃ የጤና አገልግሎቶቻችንን መጎብኘት ወይም በቀጥታ ከፋርማሲስቶቻችን ጋር መመካከር ይችላሉ። ተጨማሪ ለማወቅ ከታች ያሉትን አቋራጮች ይጠቀሙ።`;
      } else if (language === 'ti') {
        responseText = `ብዛዕባ **"${query}"** ዝሓተትክምዎ ተቐቢለ ኣለኹ። ተወሳኺ ሓበሬታ ንምርካብ ናይ ጥዕና ኣገልግሎትና ተወከሱ ወይ ምስ ፋርማሲስት ተማኸሩ።`;
      } else if (language === 'om') {
        responseText = `Gaaffii keessan waa'ee **"${query}"** fudhadheera. Odeeffannoo dabalataaf ogeessa faarmasii keenya mariisisaa yookiin kuusaa qorichaa keenya daawwadhaa.`;
      } else if (language === 'af') {
        responseText = `Essero **"${query}"** fan wagarisen. Qokoluh pharmacist wagarissa beeta.`;
      } else if (language === 'so') {
        responseText = `Su'aashaada ku saabsan **"${query}"** waan helnay. Wixii faahfaahin dheeraad ah fadlan la hadal farmashiistaha ama eeg adeegyadeena.`;
      } else {
        responseText = `Thank you for asking about **"${query}"**. As your Michu AI assistant, I can help you search our medicine catalog, verify dosage recommendations, locate nearby 24/7 branches, or schedule a telehealth clinical session.`;
      }

      responseLinks = [
        { label: language === 'am' ? 'መድሃኒቶችን ይፈልጉ' : 'Search Pharmacy Catalog', url: '/products', icon: '🔍' },
        { label: language === 'am' ? 'የመድሃኒት ዳታቤዝ' : 'Drug Safety Database', url: '/health?action=drug-info', icon: '📖' },
        { label: language === 'am' ? 'የቅርንጫፎች አድራሻ' : 'Branch Locator', url: '/branches', icon: '📍' }
      ];
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionLinks: responseLinks,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMessage]);

    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleClearChat = () => {
    const greetingText = currentLanguageOption.greeting || 'Hello! How can Michu AI assist you today?';
    setMessages([
      {
        id: 'reset-welcome',
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const promptChips = [
    { label: t('ai.prompt_dosage'), query: 'Paracetamol dosage and side effects' },
    { label: t('ai.prompt_branches'), query: 'Which branches are open 24 hours?' },
    { label: t('ai.prompt_rx'), query: 'How do I upload a prescription?' },
    { label: t('ai.prompt_consult'), query: 'How to book a pharmacist consultation?' },
    { label: t('ai.prompt_payment'), query: 'How can I pay using Telebirr and CBE?' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col transition-all duration-300 overflow-hidden mb-4 ${
            isMinimized
              ? 'h-14 w-80'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-xl shadow-inner">
                  🤖
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${isOffline ? 'bg-amber-400 border-amber-900' : 'bg-emerald-400 border-emerald-900'} border-2 rounded-full ${isOffline ? '' : 'animate-pulse'}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight leading-none text-white">
                    {t('ai.launcher_title')}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    {currentLanguageOption.flag} {currentLanguageOption.code.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 font-medium mt-1 flex items-center gap-1">
                  {isOffline ? (
                    <span className="text-amber-300 font-bold">⚡ Offline Mode</span>
                  ) : (
                    <span>{t('ai.status_online')}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title={t('ai.clear_chat')}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition text-xs"
                aria-label="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                aria-label="Minimize"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words">
                        {msg.text}
                      </div>

                      {/* Action Links / Buttons attached to message */}
                      {msg.actionLinks && msg.actionLinks.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                          {msg.actionLinks.map((link, idx) => (
                            <Link
                              key={idx}
                              href={link.url}
                              onClick={() => {
                                if (window.innerWidth < 640) setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/70 transition shadow-2xs"
                            >
                              {link.icon && <span>{link.icon}</span>}
                              <span>{link.label}</span>
                              <span className="text-[10px] text-emerald-600">&rarr;</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start">
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-none px-4 py-3 shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.query)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold transition shadow-2xs whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Medical Disclaimer Note */}
              <div className="px-3 py-1 bg-amber-50/70 border-t border-amber-100 text-[10px] text-amber-800/80 flex items-center gap-1 shrink-0">
                <span>⚠️</span>
                <span className="truncate">{t('ai.disclaimer')}</span>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('ai.input_placeholder')}
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-1"
                >
                  <span>{t('ai.send')}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Action Launcher Button */}
      <button
        onClick={handleToggle}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-xl hover:shadow-2xl hover:from-emerald-800 hover:to-teal-800 active:scale-95 transition-all duration-200 border-2 border-white/40"
        aria-label="Open AI Assistant"
      >
        {/* Glowing pulse ring */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 blur-sm group-hover:bg-emerald-400/50 transition animate-pulse pointer-events-none" />

        <div className="relative flex items-center justify-center">
          <span className="text-xl">🤖</span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-black tracking-tight leading-tight flex items-center gap-1">
            <span>Michu AI</span>
            <span className="text-[9px] bg-emerald-400/30 text-emerald-100 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
              {currentLanguageOption.code}
            </span>
          </span>
          <span className="text-[10px] text-emerald-200/90 font-medium leading-none mt-0.5 hidden sm:inline">
            {t('ai.launcher_tooltip')}
          </span>
        </div>
      </button>

    </div>
  );
}
