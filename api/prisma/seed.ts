import { PrismaClient, UserRole, ContentStatus, MenuItemType, LinkType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据生成...');

  // 清空现有数据
  console.log('🗑️  清空现有数据...');
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();

  console.log('✅ 数据清空完成');

  // 1. 创建网站配置
  console.log('\n📝 创建网站配置...');
  const site = await prisma.site.create({
    data: {
      name: '绿野水培 - 专业水培设备供应商',
      domain: 'https://hydroponics-pro.com',
      locale: 'zh-CN',
      themeTokens: {
        primaryColor: '#10B981',
        secondaryColor: '#059669',
        accentColor: '#34D399',
      },
      settings: {
        logo: '/uploads/logo.png',
        favicon: '/uploads/favicon.ico',
        description: '专注于家庭和商业水培系统的研发、生产和销售,提供一站式水培解决方案',
        keywords: ['水培', '水培设备', '无土栽培', '智能种植', '家庭农场'],
        author: '绿野水培科技有限公司',
      },
    },
  });
  console.log(`✅ 网站配置创建完成: ${site.name}`);

  // 2. 创建用户
  console.log('\n👥 创建用户账户...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@hydroponics.com',
      passwordHash,
      displayName: '张总 (Owner)',
      role: UserRole.OWNER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hydroponics.com',
      passwordHash,
      displayName: '李经理 (Admin)',
      role: UserRole.ADMIN,
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@hydroponics.com',
      passwordHash,
      displayName: '王编辑 (Editor)',
      role: UserRole.EDITOR,
    },
  });

  const author = await prisma.user.create({
    data: {
      email: 'author@hydroponics.com',
      passwordHash,
      displayName: '刘作者 (Author)',
      role: UserRole.AUTHOR,
    },
  });

  console.log(`✅ 创建了 4 个用户账户`);

  // 3. 创建分类
  console.log('\n📁 创建内容分类...');

  const categoryHome = await prisma.category.create({
    data: {
      name: '家庭水培',
      slug: 'home-hydroponics',
      order: 1,
      isActive: true,
    },
  });

  const categoryCommercial = await prisma.category.create({
    data: {
      name: '商业水培',
      slug: 'commercial-hydroponics',
      order: 2,
      isActive: true,
    },
  });

  const categoryEducation = await prisma.category.create({
    data: {
      name: '水培教程',
      slug: 'hydroponics-education',
      order: 3,
      isActive: true,
    },
  });

  const categoryNews = await prisma.category.create({
    data: {
      name: '行业资讯',
      slug: 'industry-news',
      order: 4,
      isActive: true,
    },
  });

  // 子分类
  const categoryBeginner = await prisma.category.create({
    data: {
      name: '新手入门',
      slug: 'beginner-guide',
      parentId: categoryEducation.id,
      order: 1,
      isActive: true,
    },
  });

  const categoryAdvanced = await prisma.category.create({
    data: {
      name: '进阶技巧',
      slug: 'advanced-techniques',
      parentId: categoryEducation.id,
      order: 2,
      isActive: true,
    },
  });

  console.log(`✅ 创建了 6 个分类`);

  // 4. 创建标签
  console.log('\n🏷️  创建内容标签...');

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'NFT水培', slug: 'nft-hydroponics' } }),
    prisma.tag.create({ data: { name: 'DWC深水培', slug: 'dwc-hydroponics' } }),
    prisma.tag.create({ data: { name: '气雾培', slug: 'aeroponics' } }),
    prisma.tag.create({ data: { name: '营养液配方', slug: 'nutrient-solution' } }),
    prisma.tag.create({ data: { name: 'LED补光', slug: 'led-grow-lights' } }),
    prisma.tag.create({ data: { name: '智能控制', slug: 'smart-control' } }),
    prisma.tag.create({ data: { name: '蔬菜种植', slug: 'vegetable-growing' } }),
    prisma.tag.create({ data: { name: '草莓种植', slug: 'strawberry-growing' } }),
    prisma.tag.create({ data: { name: '叶菜种植', slug: 'leafy-greens' } }),
    prisma.tag.create({ data: { name: 'pH调节', slug: 'ph-control' } }),
  ]);

  console.log(`✅ 创建了 ${tags.length} 个标签`);

  // 5. 创建菜单项(先创建,后续关联Page/Post/Product)
  console.log('\n📑 创建导航菜单...');

  const menuHome = await prisma.menuItem.create({
    data: {
      menuCode: 'main',
      label: '首页',
      slug: 'home',
      type: MenuItemType.PAGE,
      linkType: LinkType.INTERNAL,
      order: 1,
      isVisible: true,
      isActive: true,
    },
  });

  const menuProducts = await prisma.menuItem.create({
    data: {
      menuCode: 'main',
      label: '产品中心',
      slug: 'products',
      type: MenuItemType.PRODUCT,
      linkType: LinkType.INTERNAL,
      order: 2,
      isVisible: true,
      isActive: true,
    },
  });

  const menuEducation = await prisma.menuItem.create({
    data: {
      menuCode: 'main',
      label: '水培学堂',
      slug: 'education',
      type: MenuItemType.POST_LIST,
      linkType: LinkType.INTERNAL,
      order: 3,
      isVisible: true,
      isActive: true,
    },
  });

  const menuNews = await prisma.menuItem.create({
    data: {
      menuCode: 'main',
      label: '新闻资讯',
      slug: 'news',
      type: MenuItemType.POST_LIST,
      linkType: LinkType.INTERNAL,
      order: 4,
      isVisible: true,
      isActive: true,
    },
  });

  const menuAbout = await prisma.menuItem.create({
    data: {
      menuCode: 'main',
      label: '关于我们',
      slug: 'about',
      type: MenuItemType.PAGE,
      linkType: LinkType.INTERNAL,
      order: 5,
      isVisible: true,
      isActive: true,
    },
  });

  console.log(`✅ 创建了 5 个菜单项`);

  // 6. 创建页面
  console.log('\n📄 创建静态页面...');

  const homePage = await prisma.page.create({
    data: {
      menuItemId: menuHome.id,
      title: '首页 - 绿野水培',
      slug: 'home',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      blocks: [
        {
          id: 'hero-1',
          type: 'HERO',
          order: 1,
          visibility: true,
          props: {
            title: '让每个家庭都拥有自己的智能农场',
            subtitle: '专业水培设备 · 15年技术积累 · 10万+用户的选择',
            backgroundImage: '/uploads/hero-bg.jpg',
            ctaText: '查看产品',
            ctaLink: '/products',
          },
        },
        {
          id: 'features-1',
          type: 'FEATURES',
          order: 2,
          visibility: true,
          props: {
            title: '为什么选择水培?',
            features: [
              {
                icon: 'water-drop',
                title: '节水90%',
                description: '循环利用营养液,比土培节水90%以上',
              },
              {
                icon: 'growth',
                title: '生长快30%',
                description: '营养精准控制,生长速度提升30%',
              },
              {
                icon: 'clean',
                title: '零农药',
                description: '室内种植,无病虫害,不需要农药',
              },
              {
                icon: 'automation',
                title: '全自动',
                description: '智能控制系统,手机APP远程管理',
              },
            ],
          },
        },
        {
          id: 'product-showcase-1',
          type: 'PRODUCT_SHOWCASE',
          order: 3,
          visibility: true,
          props: {
            title: '热门产品',
            displayMode: 'featured',
          },
        },
      ],
      meta: {
        title: '绿野水培 - 专业水培设备供应商 | 智能家庭农场解决方案',
        description: '专注水培技术15年,提供家庭/商业水培系统、智能种植设备,一站式水培解决方案',
        keywords: ['水培设备', '智能种植', '家庭农场', '垂直农场', '无土栽培'],
      },
    },
  });

  const aboutPage = await prisma.page.create({
    data: {
      menuItemId: menuAbout.id,
      title: '关于我们 - 公司简介',
      slug: 'about',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      blocks: [
        {
          id: 'text-1',
          type: 'TEXT',
          order: 1,
          visibility: true,
          props: {
            title: '关于绿野水培',
            content: '<p>绿野水培成立于2010年,专注于水培技术研发与推广,服务10万+用户...</p>',
          },
        },
      ],
      meta: {
        title: '关于绿野水培 - 15年专注水培技术 | 企业简介',
        description: '绿野水培成立于2010年,专注于水培技术研发与推广,服务10万+用户',
        keywords: ['公司简介', '企业介绍', '水培技术', '团队实力'],
      },
    },
  });

  console.log(`✅ 创建了 2 个页面 (含 ${3 + 1} 个区块)`);

  // 7. 创建文章
  console.log('\n📰 创建文章内容...');

  const post1 = await prisma.post.create({
    data: {
      menuItemId: menuEducation.id,
      title: '什么是水培?家庭水培完全入门指南',
      slug: 'what-is-hydroponics-beginner-guide',
      summary: '本文详细介绍水培的基本概念、优势、常见系统类型,帮助新手快速了解水培种植',
      content: {
        type: 'html',
        data: '<h2>什么是水培?</h2><p>水培(Hydroponics)是一种无土栽培技术,植物根系直接生长在营养液中...</p>',
      },
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2025-01-15'),
      authorId: author.id,
      meta: {
        title: '什么是水培?家庭水培完全入门指南 | 绿野水培',
        description: '水培新手必读!详细介绍水培基本概念、系统类型、优势分析,帮助您快速入门水培种植',
        keywords: ['水培入门', '水培是什么', '无土栽培', 'NFT', 'DWC'],
      },
    },
  });

  // 关联分类和标签
  await prisma.postCategory.createMany({
    data: [
      { postId: post1.id, categoryId: categoryBeginner.id },
    ],
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[0].id },
      { postId: post1.id, tagId: tags[1].id },
      { postId: post1.id, tagId: tags[6].id },
    ],
  });

  const post2 = await prisma.post.create({
    data: {
      menuItemId: menuEducation.id,
      title: '家庭水培系统DIY:从零开始搭建你的第一套水培装置',
      slug: 'diy-home-hydroponics-system',
      summary: '手把手教你使用常见材料DIY一套简单实用的NFT水培系统,成本不到200元',
      content: {
        type: 'html',
        data: '<h2>材料准备</h2><p>PVC管、水泵、定时器、种植杯...</p>',
      },
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2025-01-18'),
      authorId: author.id,
      meta: {
        title: 'DIY家庭水培系统教程 - 200元搭建NFT水培装置 | 绿野水培',
        description: '详细的DIY水培系统教程,包含材料清单、组装步骤、调试方法,适合新手操作',
        keywords: ['DIY水培', 'NFT系统', '家庭水培', '水培教程'],
      },
    },
  });

  await prisma.postCategory.createMany({
    data: [
      { postId: post2.id, categoryId: categoryBeginner.id },
      { postId: post2.id, categoryId: categoryHome.id },
    ],
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post2.id, tagId: tags[0].id },
      { postId: post2.id, tagId: tags[8].id },
    ],
  });

  const post3 = await prisma.post.create({
    data: {
      menuItemId: menuEducation.id,
      title: '营养液配方大全:不同作物的EC值和pH调节技巧',
      slug: 'nutrient-solution-formulas-ec-ph-guide',
      summary: '详解常见蔬菜、水果的营养液配方,EC值标准,pH调节方法及常见问题处理',
      content: {
        type: 'html',
        data: '<h2>营养液基础知识</h2><p>EC值是衡量营养液浓度的重要指标...</p>',
      },
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2025-01-20'),
      authorId: editor.id,
      meta: {
        title: '水培营养液配方大全 - EC值和pH调节完整指南 | 绿野水培',
        description: '专业营养液配方指南,包含生菜、草莓、番茄等作物的EC/pH标准值及调节技巧',
        keywords: ['营养液配方', 'EC值', 'pH调节', '水培技术'],
      },
    },
  });

  await prisma.postCategory.createMany({
    data: [
      { postId: post3.id, categoryId: categoryAdvanced.id },
    ],
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post3.id, tagId: tags[3].id },
      { postId: post3.id, tagId: tags[9].id },
    ],
  });

  const post4 = await prisma.post.create({
    data: {
      menuItemId: menuNews.id,
      title: '2025年水培行业发展趋势:智能化与垂直农场成为主流',
      slug: 'hydroponics-industry-trends-2025',
      summary: '分析2025年水培行业的最新发展趋势,包括AI控制、垂直农场、城市农业等方向',
      content: {
        type: 'html',
        data: '<h2>行业现状</h2><p>全球水培市场规模持续增长...</p>',
      },
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2025-01-22'),
      authorId: editor.id,
      meta: {
        title: '2025水培行业趋势报告 - 智能化垂直农场引领未来 | 绿野水培',
        description: '深度解析2025年水培行业发展趋势,AI、IoT、垂直农场等技术创新方向',
        keywords: ['水培趋势', '垂直农场', '智能农业', '城市农业'],
      },
    },
  });

  await prisma.postCategory.createMany({
    data: [
      { postId: post4.id, categoryId: categoryNews.id },
    ],
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post4.id, tagId: tags[5].id },
    ],
  });

  const post5 = await prisma.post.create({
    data: {
      menuItemId: menuEducation.id,
      title: '水培草莓种植全攻略(草稿待审核)',
      slug: 'strawberry-hydroponics-complete-guide-draft',
      summary: '从育苗到采收,全流程讲解水培草莓的种植技术',
      content: {
        type: 'html',
        data: '<h2>草莓品种选择</h2><p>待补充...</p>',
      },
      status: ContentStatus.DRAFT,
      authorId: author.id,
    },
  });

  await prisma.postCategory.createMany({
    data: [
      { postId: post5.id, categoryId: categoryAdvanced.id },
    ],
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post5.id, tagId: tags[7].id },
    ],
  });

  console.log(`✅ 创建了 5 篇文章 (4篇已发布, 1篇草稿)`);

  // 8. 创建产品
  console.log('\n🛒 创建产品信息...');

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: '智能家庭水培机 - 绿野小农夫',
      slug: 'smart-home-hydroponics-mini',
      summary: '适合阳台、厨房的智能水培设备,可种植12株叶菜,带APP远程控制',
      description: {
        type: 'html',
        data: '<h3>产品特点</h3><ul><li>智能光照控制</li><li>自动营养液循环</li><li>手机APP监控</li></ul>',
      },
      specs: {
        尺寸: '60cm × 40cm × 45cm',
        重量: '8kg',
        种植位: '12株',
        光源: 'LED全光谱 24W',
        水箱容量: '15L',
        适合作物: '生菜、小白菜、香菜、薄荷',
      },
      gallery: [
        '/uploads/products/mini-01.jpg',
        '/uploads/products/mini-02.jpg',
        '/uploads/products/mini-03.jpg',
      ],
      price: 899,
      categoryId: categoryHome.id,
      tags: ['LED补光', '智能控制', '叶菜种植'],
      isActive: true,
      isFeatured: true,
      meta: {
        title: '智能家庭水培机 - 绿野小农夫 | 899元包邮',
        description: '智能水培设备,12株种植位,LED补光,APP控制,适合阳台厨房种菜',
        keywords: ['家庭水培机', '智能种植', '阳台种菜', 'LED水培'],
      },
    },
  });

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: 'NFT水培系统 Pro - 家庭版',
      slug: 'nft-hydroponics-pro-home',
      summary: '专业级NFT(营养液膜)水培系统,可种植36株,适合家庭大规模种植',
      description: {
        type: 'html',
        data: '<h3>系统优势</h3><p>NFT系统是最高效的水培方式之一...</p>',
      },
      specs: {
        尺寸: '150cm × 60cm × 180cm',
        重量: '25kg',
        种植位: '36株 (3层)',
        光源: 'LED全光谱 120W',
        水箱容量: '80L',
        系统类型: 'NFT营养液膜技术',
      },
      gallery: [
        '/uploads/products/nft-pro-01.jpg',
        '/uploads/products/nft-pro-02.jpg',
      ],
      price: 2899,
      categoryId: categoryHome.id,
      tags: ['NFT水培', 'LED补光'],
      isActive: true,
      isFeatured: true,
      meta: {
        title: 'NFT水培系统Pro家庭版 - 36株种植位 | 2899元',
        description: '专业NFT水培系统,3层立体种植,120W LED补光,家庭大规模种植首选',
        keywords: ['NFT水培', '立体种植', '家庭农场', '专业水培'],
      },
    },
  });

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: '商用垂直农场系统 - 绿野云田',
      slug: 'commercial-vertical-farm-system',
      summary: '大型商用垂直农场解决方案,智能环控,可种植500+株,适合餐厅、超市',
      description: {
        type: 'html',
        data: '<h3>商业级解决方案</h3><p>集成智能环境控制系统...</p>',
      },
      specs: {
        尺寸: '300cm × 120cm × 250cm',
        重量: '150kg',
        种植位: '500株以上',
        光源: 'LED全光谱 800W',
        水箱容量: '500L',
        控制系统: '智能物联网中控',
        适用场景: '餐厅、超市、农场、科研',
      },
      gallery: [
        '/uploads/products/commercial-01.jpg',
        '/uploads/products/commercial-02.jpg',
        '/uploads/products/commercial-03.jpg',
      ],
      price: 38900,
      categoryId: categoryCommercial.id,
      tags: ['NFT水培', '智能控制'],
      isActive: true,
      isFeatured: true,
      meta: {
        title: '商用垂直农场系统 - 绿野云田 | 智能种植解决方案',
        description: '大型商业垂直农场,500+株种植,智能物联网控制,适合餐厅/超市/农场',
        keywords: ['垂直农场', '商业水培', '智能农业', '餐厅供应'],
      },
    },
  });

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: '专业水培营养液 A+B组合 5L装',
      slug: 'professional-nutrient-solution-5l',
      summary: '进口原料配制,A液+B液组合,适合所有水培作物,5L可用半年',
      description: {
        type: 'html',
        data: '<h3>产品说明</h3><p>采用进口农业级原料...</p>',
      },
      specs: {
        容量: 'A液2.5L + B液2.5L',
        稀释比例: '1:500',
        适用作物: '全部水培蔬菜水果',
        保质期: '2年',
        产地: '中国',
      },
      gallery: [
        '/uploads/products/nutrient-01.jpg',
      ],
      price: 159,
      categoryId: categoryHome.id,
      tags: ['营养液配方'],
      isActive: true,
      isFeatured: false,
    },
  });

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: 'pH/EC/TDS三合一检测仪',
      slug: 'ph-ec-tds-meter-3in1',
      summary: '高精度水质检测仪,同时测量pH、EC、TDS三项指标,带温度补偿',
      description: {
        type: 'html',
        data: '<h3>专业检测</h3><p>精确监控营养液状态...</p>',
      },
      specs: {
        测量范围: 'pH 0-14, EC 0-9999μS/cm, TDS 0-9999ppm',
        精度: 'pH ±0.01, EC ±2%, TDS ±2%',
        温度补偿: '自动0-60°C',
        电池: '2节AAA电池',
      },
      gallery: [
        '/uploads/products/meter-01.jpg',
      ],
      price: 289,
      categoryId: categoryHome.id,
      tags: ['pH调节'],
      isActive: true,
      isFeatured: false,
    },
  });

  await prisma.product.create({
    data: {
      menuItemId: menuProducts.id,
      name: 'AI智能种植机器人(即将上市)',
      slug: 'ai-planting-robot-coming-soon',
      summary: '配备AI视觉识别,自动检测植物生长状态,智能调节环境参数',
      description: {
        type: 'html',
        data: '<h3>即将发布</h3><p>敬请期待...</p>',
      },
      specs: {
        状态: '研发中',
        预计上市: '2025年Q3',
      },
      gallery: [],
      price: 0,
      categoryId: categoryCommercial.id,
      tags: ['智能控制'],
      isActive: false,
      isFeatured: false,
    },
  });

  console.log(`✅ 创建了 6 个产品 (5个激活, 1个待发布, 3个推荐)`);

  // 统计信息
  console.log('\n📊 种子数据统计:');
  console.log('='.repeat(50));
  console.log(`网站配置: 1 个`);
  console.log(`用户账户: 4 个 (OWNER/ADMIN/EDITOR/AUTHOR)`);
  console.log(`分类: 6 个 (含2个子分类)`);
  console.log(`标签: 10 个`);
  console.log(`文章: 5 篇 (4篇已发布, 1篇草稿)`);
  console.log(`产品: 6 个 (5个激活, 1个待发布, 3个推荐)`);
  console.log(`菜单项: 5 个`);
  console.log(`页面: 2 个 (含4个区块)`);
  console.log('='.repeat(50));
  console.log('\n✅ 种子数据生成完成!\n');

  console.log('📝 测试账户信息:');
  console.log('━'.repeat(50));
  console.log('Owner   - owner@hydroponics.com   - Password123');
  console.log('Admin   - admin@hydroponics.com   - Password123');
  console.log('Editor  - editor@hydroponics.com  - Password123');
  console.log('Author  - author@hydroponics.com  - Password123');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ 种子数据生成失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
