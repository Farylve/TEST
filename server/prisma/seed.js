"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Create admin user
    const adminPassword = await bcryptjs_1.default.hash('Admin123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@portfolio.com' },
        update: {},
        create: {
            email: 'admin@portfolio.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: client_1.Role.ADMIN,
            isEmailVerified: true,
            isActive: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);
    // Create demo user
    const userPassword = await bcryptjs_1.default.hash('User123!', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@portfolio.com' },
        update: {},
        create: {
            email: 'user@portfolio.com',
            password: userPassword,
            firstName: 'Demo',
            lastName: 'User',
            role: client_1.Role.USER,
            isEmailVerified: true,
            isActive: true,
        },
    });
    console.log('✅ Demo user created:', user.email);
    // Create categories
    const categories = [
        {
            name: 'Web Development',
            slug: 'web-development',
            description: 'Articles about web development technologies and practices',
            color: '#3B82F6',
        },
        {
            name: 'Mobile Development',
            slug: 'mobile-development',
            description: 'Mobile app development tutorials and insights',
            color: '#10B981',
        },
        {
            name: 'DevOps',
            slug: 'devops',
            description: 'DevOps practices, tools, and methodologies',
            color: '#F59E0B',
        },
        {
            name: 'Design',
            slug: 'design',
            description: 'UI/UX design principles and trends',
            color: '#EF4444',
        },
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
        { name: 'React', slug: 'react', color: '#61DAFB' },
        { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
        { name: 'Node.js', slug: 'nodejs', color: '#339933' },
        { name: 'Next.js', slug: 'nextjs', color: '#000000' },
        { name: 'Express', slug: 'express', color: '#000000' },
        { name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
        { name: 'Prisma', slug: 'prisma', color: '#2D3748' },
        { name: 'Docker', slug: 'docker', color: '#2496ED' },
        { name: 'AWS', slug: 'aws', color: '#FF9900' },
        { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
    ];
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { slug: tag.slug },
            update: {},
            create: tag,
        });
    }
    console.log('✅ Tags created');
    // Create sample projects
    const projects = [
        {
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce platform built with Next.js and Node.js',
            content: 'A comprehensive e-commerce solution featuring user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
            slug: 'ecommerce-platform',
            status: 'PUBLISHED',
            featured: true,
            demoUrl: 'https://demo-ecommerce.example.com',
            githubUrl: 'https://github.com/username/ecommerce-platform',
            technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
            metaTitle: 'E-commerce Platform - Full Stack Project',
            metaDescription: 'Modern e-commerce platform built with Next.js, Node.js, and PostgreSQL',
            publishedAt: new Date(),
        },
        {
            title: 'Task Management App',
            description: 'Collaborative task management application with real-time updates',
            content: 'A productivity app that helps teams manage tasks, track progress, and collaborate effectively with real-time synchronization.',
            slug: 'task-management-app',
            status: 'PUBLISHED',
            featured: false,
            demoUrl: 'https://demo-tasks.example.com',
            githubUrl: 'https://github.com/username/task-management',
            technologies: ['React', 'Express', 'Socket.io', 'MongoDB', 'Material-UI'],
            metaTitle: 'Task Management App - Collaborative Tool',
            metaDescription: 'Real-time collaborative task management application',
            publishedAt: new Date(),
        },
        {
            title: 'Weather Dashboard',
            description: 'Beautiful weather dashboard with forecasts and analytics',
            content: 'An elegant weather application providing current conditions, forecasts, and weather analytics with beautiful visualizations.',
            slug: 'weather-dashboard',
            status: 'DRAFT',
            featured: false,
            demoUrl: 'https://demo-weather.example.com',
            githubUrl: 'https://github.com/username/weather-dashboard',
            technologies: ['Vue.js', 'Chart.js', 'OpenWeather API', 'Vuetify'],
            metaTitle: 'Weather Dashboard - Beautiful Weather App',
            metaDescription: 'Elegant weather dashboard with forecasts and analytics',
        },
    ];
    for (const project of projects) {
        await prisma.project.upsert({
            where: { slug: project.slug },
            update: {},
            create: project,
        });
    }
    console.log('✅ Sample projects created');
    // Create settings
    const settings = [
        { key: 'site_title', value: 'My Portfolio', type: 'STRING' },
        { key: 'site_description', value: 'Full-stack developer portfolio showcasing modern web applications', type: 'STRING' },
        { key: 'contact_email', value: 'contact@portfolio.com', type: 'STRING' },
        { key: 'github_url', value: 'https://github.com/username', type: 'STRING' },
        { key: 'linkedin_url', value: 'https://linkedin.com/in/username', type: 'STRING' },
        { key: 'twitter_url', value: 'https://twitter.com/username', type: 'STRING' },
        { key: 'posts_per_page', value: '10', type: 'NUMBER' },
        { key: 'enable_comments', value: 'true', type: 'BOOLEAN' },
        { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' },
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
//# sourceMappingURL=seed.js.map