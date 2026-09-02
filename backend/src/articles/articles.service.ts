import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

export interface ArticleResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  author: string;
  relatedProductIds?: number[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ArticlesService {
  private articles: ArticleResponse[] = [
    {
      id: 1,
      title: 'Understanding Hypertension: Causes, Symptoms, and Prevention',
      slug: 'understanding-hypertension',
      excerpt: 'High blood pressure affects millions globally. Learn about the warning signs, lifestyle changes, and treatment options available through Michu Pharmacy.',
      content: '<h3>What is Hypertension?</h3><p>Hypertension, commonly known as high blood pressure, occurs when the force of blood against arterial walls is consistently too high. Over time, untreated hypertension can damage blood vessels, leading to heart disease, stroke, or kidney complications.</p><h3>Key Lifestyle Modifications</h3><ul><li>Reduce dietary sodium intake</li><li>Engage in regular aerobic exercise</li><li>Maintain a healthy body weight</li><li>Monitor blood pressure regularly</li></ul><h3>Medication & Management</h3><p>Consult with your healthcare provider or pharmacist regarding antihypertensive medications such as ACE inhibitors, ARBs, or beta-blockers.</p>',
      featuredImage: 'article-health',
      category: 'Health Tips',
      tags: ['hypertension', 'heart health', 'prevention'],
      status: 'published',
      author: 'Dr. Solomon Bekele, PharmD',
      relatedProductIds: [8, 14, 1, 2],
      createdAt: '2026-07-12T10:00:00Z',
      updatedAt: '2026-07-12T10:00:00Z',
    },
    {
      id: 2,
      title: 'Why Daily Multivitamins Are Essential for Your Family',
      slug: 'importance-of-vitamins',
      excerpt: 'Explore how the right multivitamin can bridge nutritional gaps and support immune health for every family member.',
      content: '<h3>Bridging Nutritional Gaps</h3><p>Even with a balanced diet, busy schedules and modern food processing can leave nutritional gaps. Daily multivitamins provide essential micronutrients such as Vitamin C, Vitamin D3, Zinc, and B-Complex vitamins to keep your immune system functioning at peak performance.</p><h3>Choosing the Right Supplement</h3><p>Select supplements manufactured under strict quality standards. Look for USP or NSF certifications, and choose formulas tailored to your age and wellness goals.</p>',
      featuredImage: 'article-vitamins',
      category: 'Nutrition',
      tags: ['vitamins', 'supplements', 'wellness'],
      status: 'published',
      author: 'Bethlehem Tadesse, Clinical Nutritionist',
      relatedProductIds: [16, 17, 19, 27],
      createdAt: '2026-07-08T10:00:00Z',
      updatedAt: '2026-07-08T10:00:00Z',
    },
    {
      id: 3,
      title: 'Smart Diabetes Management: A Practical Guide',
      slug: 'diabetes-management-tips',
      excerpt: 'From insulin storage to diet planning, here are expert-backed tips for managing diabetes effectively at home.',
      content: '<h3>Daily Blood Sugar Monitoring</h3><p>Consistent blood glucose monitoring helps individuals with Type 1 or Type 2 diabetes understand how food, physical activity, and medications affect blood sugar levels.</p><h3>Medication Adherence & Storage</h3><p>Store insulin between 2°C and 8°C. Take oral hypoglycemic agents like Metformin exactly as prescribed by your doctor.</p>',
      featuredImage: 'article-diabetes',
      category: 'Chronic Care',
      tags: ['diabetes', 'metformin', 'insulin'],
      status: 'published',
      author: 'Dr. Solomon Bekele, PharmD',
      relatedProductIds: [6, 9],
      createdAt: '2026-07-03T10:00:00Z',
      updatedAt: '2026-07-03T10:00:00Z',
    },
    {
      id: 4,
      title: 'Building a Daily Skincare Routine That Actually Works',
      slug: 'skincare-routine',
      excerpt: 'Dermatologist-approved steps to achieve healthy, glowing skin using affordable and effective products available at Michu Pharmacy.',
      content: '<h3>The Essential Core Routine</h3><p>A effective skincare routine requires three core steps: Cleansing, Moisturizing, and Sun Protection. Apply broad-spectrum SPF 50 sunscreen every morning to guard against premature aging and UV damage.</p>',
      featuredImage: 'article-skincare',
      category: 'Beauty',
      tags: ['skincare', 'dermatology', 'sunscreen'],
      status: 'published',
      author: 'Helina Worku, Skincare Specialist',
      relatedProductIds: [29, 31, 34, 40],
      createdAt: '2026-06-28T10:00:00Z',
      updatedAt: '2026-06-28T10:00:00Z',
    },
    {
      id: 5,
      title: 'How to Safely Store Medications at Home',
      slug: 'safe-medication-storage',
      excerpt: 'Proper storage extends medication shelf life and ensures effectiveness. Learn where and how to store different types of medicines.',
      content: '<h3>Cool, Dry Places</h3><p>Avoid storing medicines in bathroom cabinets where heat and moisture can degrade active ingredients. Keep medicines in a cool, dry place out of reach of children.</p>',
      featuredImage: 'article-safety',
      category: 'Safety',
      tags: ['medication safety', 'storage', 'pharmacy advice'],
      status: 'published',
      author: 'Michu Pharmacy Team',
      relatedProductIds: [1, 2, 3],
      createdAt: '2026-06-22T10:00:00Z',
      updatedAt: '2026-06-22T10:00:00Z',
    },
    {
      id: 6,
      title: 'Maximizing Your Yene Card Loyalty Benefits',
      slug: 'loyalty-program-benefits',
      excerpt: 'Get the most out of your Yene Card. From earning points to redeeming vouchers, here is everything you need to know.',
      content: '<h3>Earn Points on Every Purchase</h3><p>Present your Yene Card or registered phone number whenever you shop at any Michu Pharmacy branch to earn points on over-the-counter medicines, vitamins, and skincare products.</p>',
      featuredImage: 'article-loyalty',
      category: 'Loyalty',
      tags: ['yene card', 'loyalty', 'discounts'],
      status: 'published',
      author: 'Michu Support Team',
      relatedProductIds: [25, 26],
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
    },
  ];

  async findAll(): Promise<ArticleResponse[]> {
    return this.articles;
  }

  async findOne(id: number): Promise<ArticleResponse> {
    const article = this.articles.find(a => a.id === id);
    if (!article) throw new NotFoundException(`Article with id ${id} not found`);
    return article;
  }

  async create(dto: CreateArticleDto): Promise<ArticleResponse> {
    const newArticle: ArticleResponse = {
      id: this.articles.length + 1,
      title: dto.title,
      slug: dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: dto.content,
      excerpt: dto.excerpt || '',
      featuredImage: dto.featuredImage || '',
      category: dto.category,
      tags: dto.tags || [],
      status: dto.status || 'draft',
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      author: dto.author || 'Admin',
      relatedProductIds: dto.relatedProductIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.articles.push(newArticle);
    return newArticle;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<ArticleResponse> {
    const article = await this.findOne(id);
    Object.assign(article, dto);
    article.updatedAt = new Date().toISOString();
    return article;
  }

  async remove(id: number): Promise<{ message: string }> {
    const article = await this.findOne(id);
    this.articles = this.articles.filter(a => a.id !== id);
    return { message: `Article "${article.title}" deleted` };
  }
}
