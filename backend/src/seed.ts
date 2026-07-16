import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

const SAMPLE_PRODUCTS = [
  {
    name: '(Exedexe) Dextromethorphan syrup 120ml',
    price: 240,
    brand: 'Exedexe',
    category: 'Medicines',
    prescriptionRequired: false,
    imageType: 'syrup',
    branches: ['Adama Branch', 'Ayat Branch', 'Hawassa Branch'],
    stock: 50,
    description: 'Dextromethorphan cough suppressant syrup',
  },
  {
    name: '(Nicardia retard 20) Nifedipine 20mg of 100',
    price: 25,
    brand: 'Nicardia',
    category: 'Medicines',
    prescriptionRequired: true,
    imageType: 'tablet',
    branches: ['Bethel Branch', 'Jemo Branch', 'Adama Branch'],
    stock: 120,
    description: 'Nifedipine extended-release tablets for hypertension',
  },
  {
    name: '(Zoxan-D) Ciprofloxacin 0.3% + Dexamethason 5ml',
    price: 290,
    brand: 'Zoxan-D',
    category: 'Medicines',
    prescriptionRequired: true,
    imageType: 'drops',
    branches: ['Figa Branch', 'Hawassa Branch', 'Ayat Branch'],
    stock: 30,
    description: 'Antibiotic eye drops',
  },
  {
    name: '3D white charcoal whitening Tp of 204g',
    price: 500,
    brand: 'Crest',
    category: 'Cosmetics',
    prescriptionRequired: false,
    imageType: 'cosmetic',
    branches: ['Ayat Branch', 'Hawassa Branch', 'Jemo Branch'],
    stock: 45,
    description: 'Whitening toothpaste with charcoal',
  },
  {
    name: 'Absolute Lip Gloss Clear Glow',
    price: 73.91,
    brand: 'Other',
    category: 'Cosmetics',
    prescriptionRequired: false,
    imageType: 'cosmetic',
    branches: ['Jemo Branch', 'Dire Dawa Branch', 'Figa Branch'],
    stock: 60,
    description: 'Clear glow lip gloss',
  },
  {
    name: 'Acetazolamide 250mg of 10*10 tablet',
    price: 225,
    brand: 'Other',
    category: 'Medicines',
    prescriptionRequired: true,
    imageType: 'tablet',
    branches: ['Adama Branch', 'Bethel Branch', 'Dire Dawa Branch'],
    stock: 80,
    description: 'Acetazolamide diuretic tablets',
  },
  {
    name: 'Actrapid 100iu/ml 10ml/vial soluble insulin',
    price: 1155,
    brand: 'Other',
    category: 'Medicines',
    prescriptionRequired: true,
    imageType: 'tablet',
    branches: ['Dire Dawa Branch', 'Ayat Branch', 'Jemo Branch'],
    stock: 25,
    description: 'Soluble insulin injection',
  },
  {
    name: 'Acyclovir Denk 200mg of 5*10 tabletten',
    price: 460,
    brand: 'Acyclovir Denk',
    category: 'Medicines',
    prescriptionRequired: true,
    imageType: 'tablet',
    branches: ['Hawassa Branch', 'Jemo Branch', 'Bethel Branch'],
    stock: 40,
    description: 'Antiviral tablets',
  },
  {
    name: 'Michu Daily Multi-Vitamin Capsules',
    price: 350,
    brand: 'Other',
    category: 'Supplements',
    prescriptionRequired: false,
    imageType: 'tablet',
    branches: ['All Branches', 'Ayat Branch', 'Adama Branch'],
    stock: 100,
    description: 'Daily multivitamin supplement',
  },
  {
    name: 'Sterile Nebulizer Compressor Device',
    price: 2450,
    brand: 'Other',
    category: 'Medical Devices',
    prescriptionRequired: false,
    imageType: 'device',
    branches: ['Adama Branch', 'Bethel Branch', 'Jemo Branch'],
    stock: 10,
    description: 'Nebulizer compressor for respiratory treatments',
  },
  {
    name: 'Anti-Bacterial Hand Spray 100ml',
    price: 95,
    brand: 'Other',
    category: 'Personal Care',
    prescriptionRequired: false,
    imageType: 'spray',
    branches: ['All Branches', 'Figa Branch', 'Dire Dawa Branch'],
    stock: 200,
    description: 'Anti-bacterial hand sanitizer spray',
  },
];

async function seed() {
  const app = await NestFactory.create(AppModule);
  const productsService = app.get(ProductsService);

  console.log('🌱 Starting to seed products...');

  for (const product of SAMPLE_PRODUCTS) {
    const existing = await productsService.findAll();
    if (!existing.find((p: any) => p.name === product.name)) {
      await productsService.create(product);
      console.log(`✅ Created: ${product.name}`);
    }
  }

  console.log('✅ Seeding complete!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
