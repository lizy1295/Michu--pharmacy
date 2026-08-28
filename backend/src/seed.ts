import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { CategoriesService } from './categories/categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Admin } from './admins/entities/admin.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@michu/shared';

const SAMPLE_CATEGORIES = [
  { name: 'Medicines', slug: 'medicines', description: 'Prescription & OTC pharmaceuticals', status: 'active', displayOrder: 1 },
  { name: 'Cosmetics', slug: 'cosmetics', description: 'Skincare, haircare, and beauty products', status: 'active', displayOrder: 2 },
  { name: 'Supplements', slug: 'supplements', description: 'Vitamins, minerals, and dietary supplements', status: 'active', displayOrder: 3 },
  { name: 'Medical Devices', slug: 'medical-devices', description: 'Diagnostic tools, nebulizers, and home healthcare devices', status: 'active', displayOrder: 4 },
  { name: 'Personal Care', slug: 'personal-care', description: 'Hygiene, oral care, and sanitizers', status: 'active', displayOrder: 5 },
];

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

const ADMIN_ACCOUNTS = [
  {
    email: 'admin@michupharmacy.com',
    password: 'password123',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPERADMIN,
    phone: '+251-911-000-000',
  },
  {
    email: 'superadmin@michupharmacy.com',
    password: 'password123',
    firstName: 'Super',
    lastName: 'Admin',
    role: UserRole.SUPERADMIN,
    phone: '+251-911-111-111',
  },
  {
    email: 'pharmacist@michupharmacy.com',
    password: 'password123',
    firstName: 'Lead',
    lastName: 'Pharmacist',
    role: UserRole.PHARMACIST,
    phone: '+251-911-222-222',
  },
];

async function seed() {
  const app = await NestFactory.create(AppModule);
  const categoriesService = app.get(CategoriesService);
  const productsService = app.get(ProductsService);
  const userRepo: Repository<User> = app.get(getRepositoryToken(User));
  const adminRepo: Repository<Admin> = app.get(getRepositoryToken(Admin));

  console.log('🌱 Starting to seed admin accounts and roles...');
  const passwordHash = await bcrypt.hash('password123', 10);

  for (const acc of ADMIN_ACCOUNTS) {
    // 1. Seed or update in users table
    const existingUser = await userRepo.findOne({ where: { email: acc.email } });
    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.role = acc.role;
      existingUser.isActive = true;
      existingUser.firstName = acc.firstName;
      existingUser.lastName = acc.lastName;
      await userRepo.save(existingUser);
      console.log(`✅ User Account Updated: ${acc.email} (${acc.role})`);
    } else {
      const newUser = userRepo.create({
        email: acc.email,
        passwordHash,
        firstName: acc.firstName,
        lastName: acc.lastName,
        role: acc.role,
        roleId: acc.role === UserRole.SUPERADMIN ? 3 : 4,
        phone: acc.phone,
        isActive: true,
        emailVerified: true,
      });
      await userRepo.save(newUser);
      console.log(`✅ User Account Created: ${acc.email} (${acc.role})`);
    }

    // 2. Seed or update in admins table
    const existingAdmin = await adminRepo.findOne({ where: { email: acc.email } });
    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = acc.role;
      existingAdmin.isActive = true;
      existingAdmin.name = `${acc.firstName} ${acc.lastName}`;
      await adminRepo.save(existingAdmin);
      console.log(`✅ Admin Record Updated: ${acc.email}`);
    } else {
      const newAdmin = adminRepo.create({
        email: acc.email,
        passwordHash,
        name: `${acc.firstName} ${acc.lastName}`,
        role: acc.role,
        phone: acc.phone,
        isActive: true,
      });
      await adminRepo.save(newAdmin);
      console.log(`✅ Admin Record Created: ${acc.email}`);
    }
  }

  console.log('🌱 Starting to seed categories...');
  for (const category of SAMPLE_CATEGORIES) {
    try {
      const existing = await categoriesService.findAll();
      if (!existing.find((c: any) => c.slug === category.slug)) {
        await categoriesService.create(category as any);
        console.log(`✅ Category Created: ${category.name}`);
      }
    } catch (err: any) {
      console.log(`ℹ️ Category ${category.name}: ${err.message}`);
    }
  }

  console.log('🌱 Starting to seed products...');
  for (const product of SAMPLE_PRODUCTS) {
    const existing = await productsService.findAll();
    if (!existing.data.find((p: any) => p.name === product.name)) {
      await productsService.create(product);
      console.log(`✅ Product Created: ${product.name}`);
    }
  }

  console.log('✅ Seeding complete!');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

