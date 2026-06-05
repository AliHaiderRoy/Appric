-- 007_cms_seed.sql
-- Default website content (matches current static site)

INSERT INTO site_settings (key, value) VALUES
('hero', '{
  "badge": "Innovative Software Solutions",
  "headline": "Building the Future with",
  "headlineHighlight": "Cutting-Edge Technology",
  "subheadline": "We deliver modern, secure, and scalable digital solutions. From web development to AI integration, we transform your vision into reality.",
  "primaryCtaLabel": "Get Started",
  "primaryCtaHref": "/contact",
  "secondaryCtaLabel": "View Our Work",
  "secondaryCtaHref": "/portfolio"
}'::jsonb),
('stats', '{
  "items": [
    {"number": "100+", "label": "Projects Delivered"},
    {"number": "50+", "label": "Happy Clients"},
    {"number": "15+", "label": "Team Members"},
    {"number": "5+", "label": "Years Experience"}
  ]
}'::jsonb),
('contact', '{
  "email": "info@appric.com",
  "phone": "+92 300 1234567",
  "address": "Lahore, Pakistan",
  "hours": "Mon - Fri: 9:00 AM - 6:00 PM PKT",
  "heading": "Get in Touch",
  "subheading": "Have a project in mind? We would love to hear from you."
}'::jsonb),
('about', '{
  "missionTitle": "Our Mission",
  "missionText": "To empower businesses with innovative software solutions that drive growth, efficiency, and digital transformation.",
  "visionTitle": "Our Vision",
  "visionText": "To be the leading software house recognized for excellence, innovation, and client success across the globe.",
  "values": [
    {"icon": "TrendingUp", "title": "Innovation", "description": "We embrace cutting-edge technologies and creative solutions to stay ahead of the curve."},
    {"icon": "Award", "title": "Quality", "description": "We deliver excellence in every project with rigorous testing and attention to detail."},
    {"icon": "Shield", "title": "Transparency", "description": "Open communication and honest relationships are the foundation of our work."},
    {"icon": "Users", "title": "Client Satisfaction", "description": "Your success is our success. We are committed to exceeding expectations."}
  ]
}'::jsonb),
('services_page', '{
  "heading": "Our Services",
  "subheading": "Comprehensive software solutions tailored to your business needs. From concept to deployment, we deliver excellence at every stage."
}'::jsonb),
('site_branding', '{
  "companyName": "APPRIC",
  "tagline": "Innovative Software Solutions",
  "footerText": "Building the future with cutting-edge technology. Your trusted partner for digital transformation."
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_services (title, description, features, icon, color_gradient, sort_order, status, is_featured) VALUES
('Web Development', 'Modern, responsive websites built with Next.js, React, and cutting-edge technologies.', '["Next.js & React", "Responsive Design", "SEO Optimization", "Performance Tuning"]', 'Code', 'from-blue-500 to-cyan-500', 1, 'published', true),
('Mobile Development', 'Native and cross-platform mobile applications that deliver seamless user experiences.', '["iOS & Android", "Cross-Platform", "Native Performance", "Push Notifications"]', 'Smartphone', 'from-cyan-500 to-teal-500', 2, 'published', true),
('UI/UX Design', 'Beautiful, intuitive designs that engage users and drive conversions.', '["User Research", "Wireframing", "Prototyping", "Design Systems"]', 'Palette', 'from-teal-500 to-green-500', 3, 'published', true),
('AI & Automation', 'Intelligent solutions powered by machine learning and artificial intelligence.', '["Machine Learning", "NLP Integration", "Process Automation", "Data Analysis"]', 'Brain', 'from-green-500 to-blue-500', 4, 'published', true),
('Backend Development', 'Robust, scalable backend systems with Node.js and PostgreSQL.', '["Node.js & Express", "PostgreSQL", "RESTful APIs", "Database Design"]', 'Database', 'from-purple-500 to-pink-500', 5, 'published', false),
('Cloud Solutions', 'Deploy and scale your applications with modern cloud infrastructure.', '["AWS & Vercel", "DevOps", "CI/CD Pipelines", "Monitoring"]', 'Cloud', 'from-pink-500 to-red-500', 6, 'published', false),
('Security & Testing', 'Comprehensive security audits and quality assurance testing.', '["Security Audits", "Penetration Testing", "QA Testing", "Code Review"]', 'Shield', 'from-red-500 to-orange-500', 7, 'published', false),
('Performance Optimization', 'Maximize your application speed and efficiency.', '["Speed Optimization", "Code Splitting", "Caching Strategy", "Load Balancing"]', 'Zap', 'from-orange-500 to-yellow-500', 8, 'published', false)
ON CONFLICT DO NOTHING;

INSERT INTO site_portfolio (title, category, description, image_url, technologies, sort_order, status) VALUES
('E-Commerce Platform', 'Web Development', 'Modern online shopping platform with real-time inventory and secure payment processing.', '/modern-ecommerce-platform.jpg', '["Next.js", "MongoDB", "Stripe", "Tailwind CSS"]', 1, 'published'),
('Fitness Tracking App', 'Mobile Apps', 'Cross-platform mobile app for tracking workouts, nutrition, and health metrics.', '/fitness-mobile-app-interface.png', '["React Native", "Node.js", "MongoDB", "Firebase"]', 2, 'published'),
('SaaS Dashboard', 'UI/UX Design', 'Clean, intuitive dashboard design for a B2B analytics platform.', '/saas-analytics-dashboard.png', '["Figma", "React", "D3.js", "Material UI"]', 3, 'published'),
('AI Chatbot Platform', 'AI Solutions', 'Intelligent chatbot system with natural language processing and sentiment analysis.', '/ai-chatbot-interface.png', '["Python", "TensorFlow", "React", "WebSocket"]', 4, 'published'),
('Real Estate Portal', 'Web Development', 'Property listing platform with advanced search filters and virtual tours.', '/real-estate-website-hero.png', '["Next.js", "PostgreSQL", "Google Maps API", "AWS"]', 5, 'published'),
('Healthcare App', 'Mobile Apps', 'Telemedicine platform connecting patients with healthcare providers.', '/healthcare-mobile-app.png', '["React Native", "Node.js", "PostgreSQL", "Twilio"]', 6, 'published')
ON CONFLICT DO NOTHING;

INSERT INTO site_blog_posts (title, slug, excerpt, content, category, author_name, read_time, image_url, status, published_at) VALUES
('The Future of Web Development: Next.js 15 and Beyond', 'nextjs-15-future', 'Exploring the latest features in Next.js 15 and what they mean for modern web applications.', 'Next.js continues to evolve with server components, improved caching, and better developer experience. In this post we explore what is new and how teams can adopt these features in production.', 'Web Development', 'Alex Chen', '8 min read', '/nextjs-code-editor.jpg', 'published', NOW() - INTERVAL '5 days'),
('Building Cross-Platform Apps with React Native', 'react-native-cross-platform', 'A comprehensive guide to creating seamless mobile experiences using React Native.', 'React Native enables teams to ship iOS and Android apps from a single codebase. We cover architecture, performance, and deployment best practices.', 'Mobile', 'Sarah Johnson', '10 min read', '/mobile-app-development.jpg', 'published', NOW() - INTERVAL '8 days'),
('AI Integration in Modern Applications', 'ai-integration-modern-apps', 'How to leverage artificial intelligence to create smarter, more intuitive applications.', 'From LLM APIs to custom models, AI is reshaping product development. Learn practical integration patterns for enterprise applications.', 'AI & ML', 'Michael Brown', '12 min read', '/ai-neural-network.jpg', 'published', NOW() - INTERVAL '10 days'),
('Design Systems: Creating Consistent UI at Scale', 'design-systems-at-scale', 'Building and maintaining design systems that scale with your organization.', 'Design tokens, component libraries, and documentation are the pillars of a successful design system. Here is how we approach it at APPRIC.', 'Design', 'Emily Davis', '7 min read', '/design-system-components.jpg', 'published', NOW() - INTERVAL '12 days')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_team_members (name, role, bio, image_url, sort_order, status) VALUES
('Tanseer Hussain', 'Chief Executive Officer (CEO) & Founder', 'Visionary leader with 6+ years of experience driving tech innovation, business growth, and building high-performance mobile and digital solutions.', '/ceo.png', 1, 'published'),
('Ali Haider', 'Chief Technology Officer (CTO) | Full-Stack Blockchain Engineer', 'Expert in scalable system architecture with deep full-stack and blockchain expertise, delivering secure, efficient, and future-ready solutions.', '/cto.jpeg', 2, 'published'),
('Hashir Daudpota', 'Lead Backend Developer', 'Backend specialist focused on building robust, scalable systems with a strong emphasis on performance optimization and clean architecture.', '/hashir.jpg', 3, 'published'),
('Muhammad Awais', 'Project Manager & Mobile App Developer', 'Results-driven project manager and app developer, ensuring timely delivery of high-quality mobile solutions with precision and reliability.', '/awais.jpg', 4, 'published')
ON CONFLICT DO NOTHING;

INSERT INTO site_client_logos (name, sort_order, status) VALUES
('Acme Corp', 1, 'published'),
('TechStart', 2, 'published'),
('InnovateLabs', 3, 'published'),
('DataFlow', 4, 'published'),
('CloudSync', 5, 'published'),
('DevHub', 6, 'published'),
('CodeCraft', 7, 'published'),
('NextGen', 8, 'published')
ON CONFLICT DO NOTHING;
