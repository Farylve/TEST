import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portfolio.com' },
    update: {},
    create: {
      email: 'admin@portfolio.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash('User123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@portfolio.com' },
    update: {},
    create: {
      email: 'user@portfolio.com',
      password: userPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Demo user created:', user.email);

  // Create categories
  const categories = [
    {
      name: 'Tech',
      slug: 'tech',
      description: 'Technology and programming posts',
      color: '#3B82F6'
    },
    {
      name: 'Lifestyle',
      slug: 'lifestyle', 
      description: 'Daily life and thoughts',
      color: '#10B981'
    },
    {
      name: 'News',
      slug: 'news',
      description: 'Latest news and updates',
      color: '#F59E0B'
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // Create tags
  const tags = [
    { name: 'coding', slug: 'coding', color: '#61DAFB' },
    { name: 'motivation', slug: 'motivation', color: '#10B981' },
    { name: 'javascript', slug: 'javascript', color: '#F7DF1E' },
    { name: 'react', slug: 'react', color: '#61DAFB' },
    { name: 'ai', slug: 'ai', color: '#8B5CF6' },
    { name: 'startup', slug: 'startup', color: '#F59E0B' },
    { name: 'productivity', slug: 'productivity', color: '#EF4444' },
    { name: 'learning', slug: 'learning', color: '#3B82F6' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Tags created');

  // Create sample posts
  const posts = [
    {
      title: 'Just shipped a new feature! 🚀',
      content: 'Spent the weekend building a real-time chat feature with WebSockets. The feeling when everything just clicks is unmatched! 💻✨ #coding #javascript',
      slug: 'shipped-new-feature',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      title: 'Coffee and code ☕',
      content: 'Monday morning vibes: fresh coffee, clean code, and endless possibilities. What\'s everyone working on today? 🤔',
      slug: 'coffee-and-code',
      status: 'PUBLISHED' as const,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      title: 'React 19 is amazing! 🔥',
      content: 'The new React compiler is a game changer. No more manual memoization! Who else is excited about the future of React? #react #webdev',
      slug: 'react-19-amazing',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      title: 'AI is everywhere now 🤖',
      content: 'From coding assistants to design tools, AI is transforming how we work. Embracing it rather than fighting it seems like the smart move. Thoughts? #ai #future',
      slug: 'ai-everywhere',
      status: 'PUBLISHED' as const,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      title: 'Debugging at 2 AM 🌙',
      content: 'That moment when you find the bug that\'s been haunting you for hours... it was a missing semicolon 😅 Time for bed!',
      slug: 'debugging-2am',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      title: 'Startup life is wild 🎢',
      content: 'From idea to MVP in 2 weeks. Sleep is optional, coffee is mandatory, and the adrenaline is real! Building something people love is worth it 💪 #startup #hustle',
      slug: 'startup-life-wild',
      status: 'PUBLISHED' as const,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Learning never stops 📚',
      content: 'Just finished a course on system design. The more you learn, the more you realize how much you don\'t know. And that\'s beautiful! #learning #growth',
      slug: 'learning-never-stops',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    },
    {
      title: 'Productivity hack 💡',
      content: 'Pomodoro technique + lo-fi music + distraction-free environment = coding flow state achieved! What\'s your secret productivity weapon? #productivity #tips',
      slug: 'productivity-hack',
      status: 'PUBLISHED' as const,
      authorId: admin.id,
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  // Create posts in database
  const createdPosts = [];
  for (const post of posts) {
    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
    createdPosts.push(createdPost);
  }

  console.log('✅ Sample posts created');

  // Add categories and tags to posts
  const techCategory = await prisma.category.findUnique({ where: { slug: 'tech' } });
  const lifestyleCategory = await prisma.category.findUnique({ where: { slug: 'lifestyle' } });
  const newsCategory = await prisma.category.findUnique({ where: { slug: 'news' } });

  const codingTag = await prisma.tag.findUnique({ where: { slug: 'coding' } });
  const motivationTag = await prisma.tag.findUnique({ where: { slug: 'motivation' } });
  const reactTag = await prisma.tag.findUnique({ where: { slug: 'react' } });
  const aiTag = await prisma.tag.findUnique({ where: { slug: 'ai' } });
  const startupTag = await prisma.tag.findUnique({ where: { slug: 'startup' } });
  const productivityTag = await prisma.tag.findUnique({ where: { slug: 'productivity' } });
  const learningTag = await prisma.tag.findUnique({ where: { slug: 'learning' } });

  // Associate posts with categories and tags
  const postCategoryMappings = [
    { postSlug: 'shipped-new-feature', categoryId: techCategory?.id },
    { postSlug: 'coffee-and-code', categoryId: lifestyleCategory?.id },
    { postSlug: 'react-19-amazing', categoryId: techCategory?.id },
    { postSlug: 'ai-everywhere', categoryId: newsCategory?.id },
    { postSlug: 'debugging-2am', categoryId: lifestyleCategory?.id },
    { postSlug: 'startup-life-wild', categoryId: newsCategory?.id },
    { postSlug: 'learning-never-stops', categoryId: lifestyleCategory?.id },
    { postSlug: 'productivity-hack', categoryId: lifestyleCategory?.id },
  ];

  for (const mapping of postCategoryMappings) {
    const post = createdPosts.find(p => p.slug === mapping.postSlug);
    if (post && mapping.categoryId) {
      await prisma.postCategory.upsert({
        where: {
          postId_categoryId: {
            postId: post.id,
            categoryId: mapping.categoryId,
          },
        },
        update: {},
        create: {
          postId: post.id,
          categoryId: mapping.categoryId,
        },
      });
    }
  }

  const postTagMappings = [
    { postSlug: 'shipped-new-feature', tagIds: [codingTag?.id] },
    { postSlug: 'coffee-and-code', tagIds: [motivationTag?.id] },
    { postSlug: 'react-19-amazing', tagIds: [reactTag?.id, codingTag?.id] },
    { postSlug: 'ai-everywhere', tagIds: [aiTag?.id] },
    { postSlug: 'debugging-2am', tagIds: [codingTag?.id] },
    { postSlug: 'startup-life-wild', tagIds: [startupTag?.id, motivationTag?.id] },
    { postSlug: 'learning-never-stops', tagIds: [learningTag?.id] },
    { postSlug: 'productivity-hack', tagIds: [productivityTag?.id] },
  ];

  for (const mapping of postTagMappings) {
    const post = createdPosts.find(p => p.slug === mapping.postSlug);
    if (post) {
      for (const tagId of mapping.tagIds) {
        if (tagId) {
          await prisma.postTag.upsert({
            where: {
              postId_tagId: {
                postId: post.id,
                tagId: tagId,
              },
            },
            update: {},
            create: {
              postId: post.id,
              tagId: tagId,
            },
          });
        }
      }
    }
  }

  console.log('✅ Post categories and tags assigned');

  // Create settings
  const settings = [
    { key: 'site_title', value: 'My Portfolio', type: 'STRING' as const },
    { key: 'site_description', value: 'Full-stack developer portfolio showcasing modern web applications', type: 'STRING' as const },
    { key: 'contact_email', value: 'contact@portfolio.com', type: 'STRING' as const },
    { key: 'github_url', value: 'https://github.com/username', type: 'STRING' as const },
    { key: 'linkedin_url', value: 'https://linkedin.com/in/username', type: 'STRING' as const },
    { key: 'twitter_url', value: 'https://twitter.com/username', type: 'STRING' as const },
    { key: 'posts_per_page', value: '10', type: 'NUMBER' as const },
    { key: 'enable_comments', value: 'true', type: 'BOOLEAN' as const },
    { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' as const },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Settings created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo accounts:');
  console.log('Admin: admin@portfolio.com / Admin123!');
  console.log('User: user@portfolio.com / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });