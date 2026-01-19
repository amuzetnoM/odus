
import { Injectable } from '@angular/core';
import { Task } from './project.service';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: 'software' | 'marketing' | 'personal' | 'business' | 'creative';
  icon: string;
  tasks: Partial<Task>[];
}

@Injectable({
  providedIn: 'root'
})
export class TemplateLibraryService {
  
  private templates: ProjectTemplate[] = [
    {
      id: 'saas-mvp',
      title: 'SaaS MVP Launch',
      description: 'Complete workflow for launching a Software-as-a-Service minimum viable product',
      category: 'software',
      icon: 'rocket',
      tasks: [
        {
          title: 'Market Research & Validation',
          description: '**Research target market** and validate product-market fit. Conduct **competitor analysis** and identify unique value proposition. Survey potential customers to understand pain points.',
          priority: 'high',
          status: 'todo',
          tags: ['RESEARCH', 'STRAT'],
          dependencyIds: []
        },
        {
          title: 'Technical Architecture Design',
          description: 'Design **system architecture** and choose tech stack. Define **database schema**, API structure, and infrastructure requirements. Document technical decisions.',
          priority: 'high',
          status: 'todo',
          tags: ['ARCH', 'TECH'],
          dependencyIds: []
        },
        {
          title: 'User Authentication System',
          description: 'Implement **secure authentication** with JWT tokens. Add password reset, email verification, and session management. Integrate OAuth for social logins.',
          priority: 'high',
          status: 'todo',
          tags: ['AUTH', 'SEC'],
          dependencyIds: []
        },
        {
          title: 'Core Feature Development',
          description: 'Build the **primary product features** that solve the core user problem. Focus on **MVP functionality** only. Implement responsive UI components.',
          priority: 'high',
          status: 'todo',
          tags: ['FEAT', 'DEV'],
          dependencyIds: []
        },
        {
          title: 'Payment Integration',
          description: 'Integrate **Stripe or PayPal** for payment processing. Implement subscription plans, billing cycles, and payment webhooks. Add invoice generation.',
          priority: 'medium',
          status: 'todo',
          tags: ['PAY', 'INT'],
          dependencyIds: []
        },
        {
          title: 'Admin Dashboard',
          description: 'Create **admin panel** for user management, analytics, and system monitoring. Add charts for key metrics and user activity tracking.',
          priority: 'medium',
          status: 'todo',
          tags: ['ADMIN', 'UI'],
          dependencyIds: []
        },
        {
          title: 'API Documentation',
          description: 'Write comprehensive **API documentation** using Swagger/OpenAPI. Include examples, error codes, and integration guides for developers.',
          priority: 'low',
          status: 'todo',
          tags: ['DOCS', 'API'],
          dependencyIds: []
        },
        {
          title: 'Testing & QA',
          description: 'Write **unit tests** and **integration tests**. Perform security audits, load testing, and cross-browser compatibility checks.',
          priority: 'medium',
          status: 'todo',
          tags: ['TEST', 'QA'],
          dependencyIds: []
        },
        {
          title: 'Landing Page & Marketing Site',
          description: 'Design and build **marketing website** with clear value proposition. Add pricing page, feature comparison, testimonials, and CTA buttons.',
          priority: 'medium',
          status: 'todo',
          tags: ['MKT', 'WEB'],
          dependencyIds: []
        },
        {
          title: 'Beta Launch & User Feedback',
          description: 'Launch **closed beta** to early adopters. Collect feedback, track user behavior with analytics, and iterate on features.',
          priority: 'high',
          status: 'todo',
          tags: ['LAUNCH', 'FEED'],
          dependencyIds: []
        }
      ]
    },
    {
      id: 'mobile-app',
      title: 'Mobile App Development',
      description: 'Cross-platform mobile application development workflow',
      category: 'software',
      icon: 'phone',
      tasks: [
        {
          title: 'Requirements & Wireframing',
          description: 'Define **app requirements** and create detailed wireframes. Map out user flows, screen transitions, and navigation structure.',
          priority: 'high',
          status: 'todo',
          tags: ['PLAN', 'UI/UX']
        },
        {
          title: 'UI/UX Design System',
          description: 'Create **design system** with color palette, typography, and component library. Design high-fidelity mockups for all screens.',
          priority: 'high',
          status: 'todo',
          tags: ['DESIGN', 'UI/UX']
        },
        {
          title: 'Development Environment Setup',
          description: 'Set up **React Native** or Flutter development environment. Configure build tools, emulators, and version control.',
          priority: 'high',
          status: 'todo',
          tags: ['SETUP', 'DEV']
        },
        {
          title: 'Core Screen Implementation',
          description: 'Build **main application screens** with navigation. Implement state management and component architecture.',
          priority: 'high',
          status: 'todo',
          tags: ['FEAT', 'DEV']
        },
        {
          title: 'Backend API Integration',
          description: 'Connect to **REST or GraphQL API**. Implement data fetching, caching, and offline support.',
          priority: 'medium',
          status: 'todo',
          tags: ['API', 'INT']
        },
        {
          title: 'Push Notifications',
          description: 'Integrate **Firebase Cloud Messaging** or similar. Implement notification handling and deep linking.',
          priority: 'medium',
          status: 'todo',
          tags: ['NOTIF', 'FEAT']
        },
        {
          title: 'App Store Preparation',
          description: 'Create **app store listings** with screenshots, descriptions, and keywords. Prepare privacy policy and terms of service.',
          priority: 'low',
          status: 'todo',
          tags: ['PUBLISH', 'MKT']
        },
        {
          title: 'Testing & Device Compatibility',
          description: 'Test on **multiple devices** and OS versions. Fix platform-specific bugs and ensure consistent UI.',
          priority: 'medium',
          status: 'todo',
          tags: ['TEST', 'QA']
        },
        {
          title: 'App Store Submission',
          description: 'Submit to **Apple App Store** and **Google Play Store**. Address review feedback and handle approval process.',
          priority: 'high',
          status: 'todo',
          tags: ['LAUNCH', 'OPS']
        }
      ]
    },
    {
      id: 'marketing-campaign',
      title: 'Marketing Campaign',
      description: 'Launch a comprehensive marketing campaign from planning to execution',
      category: 'marketing',
      icon: 'megaphone',
      tasks: [
        {
          title: 'Campaign Strategy & Goals',
          description: 'Define **campaign objectives**, target audience, and KPIs. Set budget and timeline for execution.',
          priority: 'high',
          status: 'todo',
          tags: ['STRAT', 'PLAN']
        },
        {
          title: 'Content Creation',
          description: 'Create **marketing content** including blog posts, videos, graphics, and email copy. Ensure brand consistency.',
          priority: 'high',
          status: 'todo',
          tags: ['CONTENT', 'CREATE']
        },
        {
          title: 'Social Media Strategy',
          description: 'Plan **social media content calendar**. Schedule posts across platforms and prepare engagement strategies.',
          priority: 'medium',
          status: 'todo',
          tags: ['SOCIAL', 'MKT']
        },
        {
          title: 'Email Marketing Setup',
          description: 'Create **email sequences** and automation workflows. Design templates and segment audience lists.',
          priority: 'medium',
          status: 'todo',
          tags: ['EMAIL', 'AUTO']
        },
        {
          title: 'Paid Advertising Setup',
          description: 'Configure **Google Ads** and **Facebook Ads** campaigns. Set targeting, budgets, and tracking pixels.',
          priority: 'medium',
          status: 'todo',
          tags: ['ADS', 'PAID']
        },
        {
          title: 'Landing Page Optimization',
          description: 'Build and optimize **conversion-focused landing pages**. Implement A/B testing for headlines and CTAs.',
          priority: 'high',
          status: 'todo',
          tags: ['WEB', 'CRO']
        },
        {
          title: 'Analytics & Tracking',
          description: 'Set up **Google Analytics**, UTM parameters, and conversion tracking. Create dashboards for monitoring.',
          priority: 'low',
          status: 'todo',
          tags: ['TRACK', 'DATA']
        },
        {
          title: 'Campaign Launch',
          description: 'Execute **full campaign launch** across all channels. Monitor initial performance and respond to issues.',
          priority: 'high',
          status: 'todo',
          tags: ['LAUNCH', 'OPS']
        },
        {
          title: 'Performance Analysis & Optimization',
          description: 'Analyze **campaign metrics** and ROI. Optimize underperforming channels and scale successful ones.',
          priority: 'medium',
          status: 'todo',
          tags: ['ANAL', 'OPT']
        }
      ]
    },
    {
      id: 'wedding-planning',
      title: 'Wedding Planning',
      description: 'Organize and plan a wedding from start to finish',
      category: 'personal',
      icon: 'heart',
      tasks: [
        {
          title: 'Budget & Guest List',
          description: 'Set **wedding budget** and create initial guest list. Allocate funds to different categories.',
          priority: 'high',
          status: 'todo',
          tags: ['PLAN', 'FIN']
        },
        {
          title: 'Venue Selection',
          description: 'Research and visit **wedding venues**. Book ceremony and reception locations. Sign contracts.',
          priority: 'high',
          status: 'todo',
          tags: ['VENUE', 'BOOK']
        },
        {
          title: 'Vendor Booking',
          description: 'Book **photographer**, **caterer**, **florist**, and **DJ/band**. Review contracts and confirm dates.',
          priority: 'high',
          status: 'todo',
          tags: ['VENDOR', 'BOOK']
        },
        {
          title: 'Invitations & Save the Dates',
          description: 'Design and order **wedding invitations**. Send save-the-date cards. Track RSVPs.',
          priority: 'medium',
          status: 'todo',
          tags: ['INVITE', 'COMM']
        },
        {
          title: 'Attire Selection',
          description: 'Choose **wedding dress**, **suit/tuxedo**, and **bridesmaid/groomsmen attire**. Schedule fittings.',
          priority: 'medium',
          status: 'todo',
          tags: ['ATTIRE', 'SHOP']
        },
        {
          title: 'Menu Tasting & Selection',
          description: 'Attend **catering tastings** and finalize menu. Consider dietary restrictions and allergies.',
          priority: 'medium',
          status: 'todo',
          tags: ['FOOD', 'PLAN']
        },
        {
          title: 'Ceremony Planning',
          description: 'Plan **ceremony details** including vows, readings, and music. Organize rehearsal.',
          priority: 'medium',
          status: 'todo',
          tags: ['CEREMONY', 'PLAN']
        },
        {
          title: 'Decoration & Styling',
          description: 'Choose **color scheme** and decorations. Plan centerpieces, lighting, and overall aesthetic.',
          priority: 'low',
          status: 'todo',
          tags: ['DECOR', 'STYLE']
        },
        {
          title: 'Final Coordination',
          description: 'Create **day-of timeline** and coordinate with all vendors. Confirm final details and payments.',
          priority: 'high',
          status: 'todo',
          tags: ['COORD', 'FINAL']
        }
      ]
    },
    {
      id: 'business-launch',
      title: 'Business Launch',
      description: 'Start and launch a new business venture',
      category: 'business',
      icon: 'briefcase',
      tasks: [
        {
          title: 'Business Plan Development',
          description: 'Write comprehensive **business plan** with market analysis, financial projections, and strategy.',
          priority: 'high',
          status: 'todo',
          tags: ['PLAN', 'STRAT']
        },
        {
          title: 'Legal Structure & Registration',
          description: 'Choose **business structure** (LLC, Corp, etc.) and register with state. Obtain EIN and licenses.',
          priority: 'high',
          status: 'todo',
          tags: ['LEGAL', 'REG']
        },
        {
          title: 'Brand Identity Creation',
          description: 'Develop **brand name**, logo, and visual identity. Create brand guidelines and messaging.',
          priority: 'medium',
          status: 'todo',
          tags: ['BRAND', 'DESIGN']
        },
        {
          title: 'Business Banking & Accounting',
          description: 'Open **business bank account**. Set up accounting system and bookkeeping processes.',
          priority: 'high',
          status: 'todo',
          tags: ['FIN', 'SETUP']
        },
        {
          title: 'Website & Online Presence',
          description: 'Build **professional website** and set up social media accounts. Establish online presence.',
          priority: 'medium',
          status: 'todo',
          tags: ['WEB', 'MKT']
        },
        {
          title: 'Product/Service Development',
          description: 'Finalize **product offerings** or service packages. Create pricing structure and packages.',
          priority: 'high',
          status: 'todo',
          tags: ['PROD', 'DEV']
        },
        {
          title: 'Sales & Marketing Strategy',
          description: 'Develop **sales funnel** and marketing plan. Identify customer acquisition channels.',
          priority: 'medium',
          status: 'todo',
          tags: ['SALES', 'MKT']
        },
        {
          title: 'Insurance & Risk Management',
          description: 'Obtain **business insurance**, liability coverage, and other necessary protections.',
          priority: 'low',
          status: 'todo',
          tags: ['INS', 'RISK']
        },
        {
          title: 'Soft Launch & Testing',
          description: 'Execute **soft launch** with beta customers. Gather feedback and refine operations.',
          priority: 'high',
          status: 'todo',
          tags: ['LAUNCH', 'TEST']
        },
        {
          title: 'Official Launch & Promotion',
          description: 'Launch **official opening** with promotional campaign. Execute PR strategy and outreach.',
          priority: 'high',
          status: 'todo',
          tags: ['LAUNCH', 'PR']
        }
      ]
    },
    {
      id: 'content-creation',
      title: 'Content Creation Pipeline',
      description: 'Establish a consistent content creation and publishing workflow',
      category: 'creative',
      icon: 'pen',
      tasks: [
        {
          title: 'Content Strategy',
          description: 'Define **content pillars** and themes. Identify target audience and content goals.',
          priority: 'high',
          status: 'todo',
          tags: ['STRAT', 'PLAN']
        },
        {
          title: 'Content Calendar',
          description: 'Create **editorial calendar** for 3 months. Plan topics, formats, and publishing schedule.',
          priority: 'high',
          status: 'todo',
          tags: ['PLAN', 'SCHED']
        },
        {
          title: 'Research & Ideation',
          description: 'Research **trending topics** and keywords. Brainstorm content ideas and outline pieces.',
          priority: 'medium',
          status: 'todo',
          tags: ['RESEARCH', 'IDEAS']
        },
        {
          title: 'Content Production',
          description: 'Create **blog posts**, videos, or graphics according to calendar. Maintain quality standards.',
          priority: 'high',
          status: 'todo',
          tags: ['CREATE', 'PROD']
        },
        {
          title: 'SEO Optimization',
          description: 'Optimize content for **search engines**. Add keywords, meta descriptions, and internal links.',
          priority: 'medium',
          status: 'todo',
          tags: ['SEO', 'OPT']
        },
        {
          title: 'Visual Assets',
          description: 'Create **thumbnails**, featured images, and promotional graphics. Maintain visual consistency.',
          priority: 'low',
          status: 'todo',
          tags: ['VISUAL', 'DESIGN']
        },
        {
          title: 'Publishing & Distribution',
          description: 'Publish content and distribute across **multiple channels**. Schedule social media posts.',
          priority: 'high',
          status: 'todo',
          tags: ['PUBLISH', 'DIST']
        },
        {
          title: 'Performance Tracking',
          description: 'Track **engagement metrics** and analytics. Identify top-performing content.',
          priority: 'low',
          status: 'todo',
          tags: ['ANAL', 'TRACK']
        }
      ]
    }
  ];

  getTemplates(): ProjectTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): ProjectTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplatesByCategory(category: string): ProjectTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.templates.map(t => t.category)));
  }
}
