export const mockFreelancers = [
  {
    id: 'fl-1',
    userId: 'usr-freelancer-1',
    name: 'Rahul Sharma',
    title: 'Senior Full Stack & AI Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewsCount: 52,
    hourlyRate: 65,
    location: 'Bengaluru, India',
    countryCode: 'IN',
    category: 'Web Development',
    availability: 'Available now (30+ hrs/week)',
    isAvailable: true,
    isTopRated: true,
    isVerified: true,
    totalEarned: 84200,
    jobsCompleted: 38,
    jobSuccessScore: 99,
    hoursWorked: 1420,
    responseTime: '< 1 hour',
    englishLevel: 'Fluent / Native',
    skills: ['React', 'Node.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Python', 'OpenAI API', 'GraphQL', 'AWS', 'Docker'],
    shortBio: 'Ex-Stripe engineer building enterprise web platforms, scalable microservices, and AI-driven workflow apps.',
    about: 'I am a senior full-stack developer and AI integrations engineer with over 8 years of experience building high-performance web applications. My core expertise is crafting responsive React/Next.js frontends paired with robust Node.js/Python backends and relational databases.\n\nOver the past 3 years, I have helped 30+ startups and scaleups deploy production-ready LLM agents, streaming chat interfaces, real-time collaborative workspaces, and automated billing pipelines with Stripe.',
    education: [
      { degree: 'B.Tech in Computer Science & Engineering', school: 'IIT Bombay', year: '2016' }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2023' },
      { name: 'Meta Certified Senior Frontend Developer', issuer: 'Meta', year: '2022' }
    ],
    portfolio: [
      {
        id: 'port-1-1',
        title: 'CognitiveDesk – Enterprise AI Knowledge Assistant',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        description: 'Built an end-to-end RAG knowledge assistant for enterprise document search with sub-50ms hybrid vector search.',
        link: 'https://cognitivedesk.demo.app',
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Pinecone', 'Python FastApi']
      },
      {
        id: 'port-1-2',
        title: 'HyperMetric – Multi-tenant SaaS Analytics',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        description: 'Engineered a real-time event analytics dashboard handling 10M+ daily events with Recharts and ClickHouse.',
        link: 'https://hypermetric.demo.io',
        technologies: ['TypeScript', 'React', 'Node.js', 'ClickHouse', 'PostgreSQL']
      },
      {
        id: 'port-1-3',
        title: 'CloudVault – Asset Collaboration Workspace',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        description: 'Real-time collaborative file management system with granular access control and presigned S3 upload pipelines.',
        link: 'https://cloudvault.demo.dev',
        technologies: ['React', 'Tailwind CSS', 'AWS S3', 'Node.js', 'WebSockets']
      }
    ],
    services: [
      {
        id: 'srv-1',
        title: 'Full Stack MVP Development',
        tier: 'Standard',
        deliveryDays: 21,
        price: 2800,
        description: 'Complete web application MVP from Figma designs to production deployment with auth, database, and payment integration.',
        features: ['Up to 8 custom responsive pages', 'User authentication & RBAC', 'Database schema & migrations', 'Stripe checkout integration', 'Vercel/AWS deployment setup']
      },
      {
        id: 'srv-2',
        title: 'AI Workflow & LLM Integration',
        tier: 'Specialized',
        deliveryDays: 10,
        price: 1600,
        description: 'Seamless integration of OpenAI/Claude LLM agents, vector embeddings, and streaming chat UIs into your existing codebase.',
        features: ['Custom RAG ingestion pipeline', 'Streaming token UI components', 'Token usage & rate limiting', 'Comprehensive test suite']
      }
    ],
    reviews: [
      {
        id: 'rev-1-1',
        clientName: 'Sarah Connor',
        clientCompany: 'Nexus Innovations',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        projectTitle: 'Real-time AI Document Assistant Frontend',
        rating: 5.0,
        date: 'Aug 14, 2026',
        cost: 3800,
        comment: 'Rahul is easily in the top 1% of frontend/AI engineers on the platform. Delivered ahead of schedule with spotless code architecture and zero bugs. Will definitely hire again!',
        criteria: { communication: 5.0, quality: 5.0, professionalism: 5.0, timeliness: 5.0 }
      },
      {
        id: 'rev-1-2',
        clientName: 'Marcus Vance',
        clientCompany: 'Vance Digital Media',
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        projectTitle: 'Next.js E-Commerce Performance Refactoring',
        rating: 4.9,
        date: 'Jul 28, 2026',
        cost: 2200,
        comment: 'Rahul boosted our Core Web Vitals score from 42 to 96 on mobile! Great communication throughout and proactive architectural improvements.',
        criteria: { communication: 5.0, quality: 4.9, professionalism: 5.0, timeliness: 4.8 }
      }
    ]
  },
  {
    id: 'fl-2',
    userId: 'usr-freelancer-2',
    name: 'Elena Rostova',
    title: 'Lead UI/UX & Product Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewsCount: 41,
    hourlyRate: 85,
    location: 'Berlin, Germany',
    countryCode: 'DE',
    category: 'UI/UX Design',
    availability: 'Available for new projects',
    isAvailable: true,
    isTopRated: true,
    isVerified: true,
    totalEarned: 96500,
    jobsCompleted: 34,
    jobSuccessScore: 100,
    hoursWorked: 1180,
    responseTime: '< 2 hours',
    englishLevel: 'Fluent',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Mobile App Design', 'Wireframing', 'Prototyping', 'User Research', 'Webflow'],
    shortBio: 'B2B SaaS & FinTech product designer crafting conversion-focused, accessible interfaces and scalable design systems.',
    about: 'I design digital products that solve complex user problems with simplicity and elegance. With 7+ years in UX/UI design across European and US tech startups, I specialize in crafting design systems in Figma that seamlessly bridge the gap between design and engineering.',
    education: [
      { degree: 'M.A. in Interaction Design', school: 'Bauhaus University Weimar', year: '2017' }
    ],
    certifications: [
      { name: 'Nielsen Norman Group UX Master Certified', issuer: 'NN/g', year: '2021' }
    ],
    portfolio: [
      {
        id: 'port-2-1',
        title: 'NovaPay – Global Treasury FinTech Dashboard',
        category: 'UI/UX Design',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
        description: 'Complete design system and web application for high-volume cross-border currency management.',
        link: 'https://figma.com/file/sample-novapay',
        technologies: ['Figma', 'Design Tokens', 'Design System', 'Prototyping']
      },
      {
        id: 'port-2-2',
        title: 'ZenPulse – Mental Wellness Mobile App',
        category: 'UI/UX Design',
        image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&auto=format&fit=crop&q=80',
        description: 'iOS & Android design system with 80+ handcrafted illustrated components and haptic interaction flows.',
        link: 'https://figma.com/file/sample-zenpulse',
        technologies: ['Figma', 'iOS Guidelines', 'Micro-interactions', 'User Testing']
      }
    ],
    services: [
      {
        id: 'srv-2-1',
        title: 'End-to-End SaaS Web App Design',
        tier: 'Premium',
        deliveryDays: 14,
        price: 2400,
        description: 'Comprehensive UI/UX design in Figma including user journeys, interactive prototype, and developer handoff specs.',
        features: ['Up to 12 responsive screens', 'Complete Figma design system tokens', 'Interactive clickable prototype', 'Developer handoff documentation']
      }
    ],
    reviews: [
      {
        id: 'rev-2-1',
        clientName: 'Sarah Connor',
        clientCompany: 'Nexus Innovations',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        projectTitle: 'AI Analytics Platform Design System',
        rating: 5.0,
        date: 'Jul 10, 2026',
        cost: 3200,
        comment: 'Elena is a design powerhouse. Her design system saved our engineering team weeks of work. Outstanding attention to detail and hierarchy.',
        criteria: { communication: 5.0, quality: 5.0, professionalism: 5.0, timeliness: 5.0 }
      }
    ]
  },
  {
    id: 'fl-3',
    userId: 'usr-freelancer-3',
    name: 'David Chen',
    title: 'Senior Mobile Engineer (iOS & Flutter)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewsCount: 37,
    hourlyRate: 75,
    location: 'Toronto, Canada',
    countryCode: 'CA',
    category: 'Mobile Development',
    availability: 'Available now (20+ hrs/week)',
    isAvailable: true,
    isTopRated: true,
    isVerified: true,
    totalEarned: 67800,
    jobsCompleted: 29,
    jobSuccessScore: 98,
    hoursWorked: 940,
    responseTime: '< 3 hours',
    englishLevel: 'Native',
    skills: ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Firebase', 'GraphQL', 'In-App Purchases', 'CI/CD Fastlane'],
    shortBio: 'Building smooth, 60fps native & cross-platform iOS/Android mobile apps with offline-first architecture.',
    about: 'Senior mobile application engineer with 6+ years shipping high-rated consumer and enterprise apps on App Store and Google Play. Expertise in Flutter, React Native, and native Swift/Kotlin bridging.',
    education: [
      { degree: 'B.S. Software Engineering', school: 'University of Waterloo', year: '2018' }
    ],
    certifications: [
      { name: 'Google Associate Android Developer', issuer: 'Google', year: '2020' }
    ],
    portfolio: [
      {
        id: 'port-3-1',
        title: 'FitTrack Pro – Cross-Platform Workout Companion',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1510519138195-068d82f0f454?w=800&auto=format&fit=crop&q=80',
        description: 'Flutter app featuring offline Bluetooth workout syncing, audio coaching, and Apple HealthKit integration.',
        link: 'https://apps.apple.com/sample-fittrack',
        technologies: ['Flutter', 'Dart', 'HealthKit', 'Firebase', 'Bloc']
      }
    ],
    services: [
      {
        id: 'srv-3-1',
        title: 'Cross-Platform Mobile App MVP',
        tier: 'Standard',
        deliveryDays: 25,
        price: 3400,
        description: 'Production-ready iOS and Android app with clean Flutter architecture, push notifications, and store submission prep.',
        features: ['iOS & Android builds', 'Push notification setup', 'Firebase backend integration', 'App store release checklist']
      }
    ],
    reviews: []
  },
  {
    id: 'fl-4',
    userId: 'usr-freelancer-4',
    name: 'Amina Al-Mansoor',
    title: 'AI/ML & NLP Solutions Architect',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    rating: 4.98,
    reviewsCount: 29,
    hourlyRate: 95,
    location: 'Dubai, UAE',
    countryCode: 'AE',
    category: 'AI & Machine Learning',
    availability: 'Available now',
    isAvailable: true,
    isTopRated: true,
    isVerified: true,
    totalEarned: 78900,
    jobsCompleted: 22,
    jobSuccessScore: 100,
    hoursWorked: 830,
    responseTime: '< 1 hour',
    englishLevel: 'Fluent',
    skills: ['Python', 'OpenAI API', 'LangChain', 'LlamaIndex', 'PyTorch', 'Vector Databases', 'FastAPI', 'Hugging Face'],
    shortBio: 'Specializing in production RAG systems, custom model fine-tuning, and autonomous multi-agent systems.',
    about: 'Machine Learning specialist and AI engineer helping businesses build scalable, robust generative AI solutions. I architect agentic workflows, fine-tune open source LLMs (Llama 3, Mistral), and optimize token latency.',
    education: [
      { degree: 'M.S. in Artificial Intelligence', school: 'ETH Zurich', year: '2019' }
    ],
    certifications: [
      { name: 'DeepLearning.AI Generative AI Specialist', issuer: 'DeepLearning.AI', year: '2023' }
    ],
    portfolio: [],
    services: [],
    reviews: []
  },
  {
    id: 'fl-5',
    userId: 'usr-freelancer-5',
    name: 'Lucas Silva',
    title: 'Senior DevOps & Cloud Infrastructure Engineer',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewsCount: 31,
    hourlyRate: 70,
    location: 'São Paulo, Brazil',
    countryCode: 'BR',
    category: 'Web Development',
    availability: 'Available now',
    isAvailable: true,
    isTopRated: false,
    isVerified: true,
    totalEarned: 51200,
    jobsCompleted: 26,
    jobSuccessScore: 96,
    hoursWorked: 760,
    responseTime: '< 4 hours',
    englishLevel: 'Fluent',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD Pipelines', 'GitHub Actions', 'PostgreSQL', 'Grafana'],
    shortBio: 'Automating high-availability cloud infrastructure, Zero-Downtime deployments, and cost optimization on AWS & GCP.',
    about: 'DevOps Engineer with 6+ years designing resilient infrastructure as code. Specializing in Kubernetes cluster provisioning, SOC2 compliance setups, and reducing AWS cloud bills by 30-50%.',
    education: [],
    certifications: [],
    portfolio: [],
    services: [],
    reviews: []
  },
  {
    id: 'fl-6',
    userId: 'usr-freelancer-6',
    name: 'Sophie Dubois',
    title: 'Brand Identity & Visual Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
    rating: 4.97,
    reviewsCount: 48,
    hourlyRate: 60,
    location: 'Paris, France',
    countryCode: 'FR',
    category: 'Graphic Design',
    availability: 'Available for new projects',
    isAvailable: true,
    isTopRated: true,
    isVerified: true,
    totalEarned: 62400,
    jobsCompleted: 45,
    jobSuccessScore: 99,
    hoursWorked: 980,
    responseTime: '< 2 hours',
    englishLevel: 'Fluent',
    skills: ['Brand Identity', 'Logo Design', 'Adobe Illustrator', 'Photoshop', 'Typography', '3D Graphics', 'Blender'],
    shortBio: 'Crafting modern, memorable visual identities and 3D brand experiences for tech scaleups.',
    about: 'Brand designer with a passion for minimalist modern typography and evocative visual systems. Over 7 years of experience helping early-stage ventures launch distinct brand identities that resonate with customers and investors.',
    education: [],
    certifications: [],
    portfolio: [],
    services: [],
    reviews: []
  }
];
