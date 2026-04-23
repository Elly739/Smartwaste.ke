/**
 * SMARTWASTE MVP - COMPLETE IMAGE MAPPING STRATEGY
 * 
 * This document outlines the systematic assignment of all available images
 * from /public/Images folder to specific UI sections and components.
 * 
 * Mapping Principles:
 * 1. Hero/Landing: Inspirational, mission-driven imagery
 * 2. Dashboard/Stats: Professional, data-context visuals
 * 3. Waste Types: Category-specific education
 * 4. Operations: Collection & logistics visuals
 * 5. Motivation: Achievement, impact, community visuals
 * 6. Empty States: Problem awareness for engagement
 */

// ============================================================================
// BRANDING ASSETS (Top Priority - Use Consistently)
// ============================================================================

export const BRANDING = {
  // Primary brand identity
  'Main Logo.jpg': {
    role: 'PRIMARY_LOGO',
    sections: ['Header', 'Authentication', 'Dashboard-Hero'],
    usage: 'Header navigation, auth pages, brand consistency',
    visual_intent: 'Professional, complete brand mark',
    priority: 'CRITICAL'
  },
  'Logo 2.jpg': {
    role: 'SECONDARY_LOGO',
    sections: ['Sidebar', 'Footer', 'Alternate Views'],
    usage: 'When primary is too large, sidebar branding',
    visual_intent: 'Compact alternative',
    priority: 'HIGH'
  },
  'Logo 3.jpg': {
    role: 'TERTIARY_LOGO',
    sections: ['Icon variant', 'Favicon alternative'],
    usage: 'Icon-only contexts',
    visual_intent: 'Minimal brand representation',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// LANDING PAGE / HOME HERO SECTION
// ============================================================================

export const LANDING_PAGE = {
  // Hero background - Primary visual
  'save earth.jpg': {
    role: 'HERO_BACKGROUND',
    section: 'Landing-Hero',
    placement: 'Full-width hero section background',
    usage: 'Above-the-fold, high-impact environmental messaging',
    visual_intent: 'Earth preservation, mission-driven',
    hierarchy: 'HERO_IMAGE',
    overlay_needed: true,
    overlay_opacity: 0.4,
    priority: 'CRITICAL'
  },
  
  // Feature highlight - Innovation/Tech forward
  'Green Tech_ Innovating for a Sustainable Future!.jpg': {
    role: 'FEATURE_HIGHLIGHT',
    section: 'Landing-Features',
    placement: 'Featured feature card or section background',
    usage: 'Highlights technological innovation in waste mgmt',
    visual_intent: 'Modern, tech-forward, sustainable',
    priority: 'HIGH'
  },
  
  // Call-to-action section
  '🌿🔄 Every action counts! 🔄🌿.jpg': {
    role: 'CTA_VISUAL',
    section: 'Landing-CTA',
    placement: 'Call-to-action section background or card',
    usage: 'Motivate user signup/engagement',
    visual_intent: 'Environmental action, community participation',
    priority: 'HIGH'
  },
  
  // Social proof / Corporate context
  'Sustainable Waste Management Solutions for Corporates in India.jpg': {
    role: 'SOCIAL_PROOF',
    section: 'Landing-Corporate',
    placement: 'Enterprise/corporate value proposition section',
    usage: 'Show business/corporate adoption',
    visual_intent: 'Professional, scalable solutions',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// AUTHENTICATION PAGES (Login/Register)
// ============================================================================

export const AUTH_PAGES = {
  // Background imagery
  'save earth.jpg': {
    role: 'AUTH_BACKGROUND',
    pages: ['login', 'register', 'reset-password'],
    placement: 'Side illustration or subtle background',
    usage: 'Build emotional connection during authentication',
    visual_intent: 'Environmental mission, trust building',
    overlay_needed: true,
    overlay_opacity: 0.5,
    priority: 'HIGH'
  }
};

// ============================================================================
// DASHBOARD HOME SECTION
// ============================================================================

export const DASHBOARD_HOME = {
  // KPI/Stats section background
  'Smart Waste Management means profit & sustainability.jpg': {
    role: 'STATS_BACKGROUND',
    section: 'Dashboard-KPI',
    placement: 'Stats cards or metrics section background',
    usage: 'Reinforce business + environmental value',
    visual_intent: 'Professional metrics, sustainability ROI',
    overlay_needed: true,
    priority: 'HIGH'
  },
  
  // Smart solutions showcase
  'Smart EcoBin_ Your Effortless Recycling Ally.jpg': {
    role: 'SOLUTIONS_SHOWCASE',
    section: 'Dashboard-Overview',
    placement: 'Feature card or product showcase',
    usage: 'Show smart bin technology integration',
    visual_intent: 'Modern smart waste solutions',
    priority: 'HIGH'
  },
  
  // Value proposition
  'turn waste to wealth.jpg': {
    role: 'VALUE_PROP',
    section: 'Dashboard-Impact',
    placement: 'Impact section or benefits card',
    usage: 'Emphasize circular economy, value creation',
    visual_intent: 'Economic + environmental benefit',
    priority: 'MEDIUM'
  },
  
  // AI/Smart features
  'Artificial Intelligence in Predictive Waste Collection - Reducing Overflow and Costs in Dubai.jpg': {
    role: 'AI_FEATURES',
    section: 'Dashboard-Technology',
    placement: 'Smart features/AI capabilities section',
    usage: 'Showcase predictive, AI-driven features',
    visual_intent: 'Cutting-edge technology, efficiency',
    priority: 'MEDIUM'
  },
  
  // App concept/UI overview
  'Ecology Mobile App UX and UI Kit.jpg': {
    role: 'APP_CONCEPT',
    section: 'Dashboard-Features',
    placement: 'Mobile/app features overview',
    usage: 'Show cross-platform app ecosystem',
    visual_intent: 'User interface, app features',
    priority: 'LOW'
  }
};

// ============================================================================
// SCAN TAB (QR Code Scanning Interface)
// ============================================================================

export const SCAN_TAB = {
  // Section background
  'Smart EcoBin_ Your Effortless Recycling Ally.jpg': {
    role: 'SECTION_BACKGROUND',
    section: 'Scan',
    placement: 'Full section background behind scanner',
    usage: 'Contextual visual while scanning bins',
    visual_intent: 'Smart bin technology context',
    overlay_needed: true,
    overlay_opacity: 0.45,
    priority: 'HIGH'
  },
  
  // Recycle bin icon/illustration
  'Download premium psd _ image of Yellow trash with a recycle symbol about yellow trash bin, recycling bin yellow, recycled bin, recycling bin, and white dustbin 475857.jpg': {
    role: 'INLINE_ILLUSTRATION',
    section: 'Scan-Instructions',
    placement: 'Step-by-step instruction card',
    usage: 'Visual guide for bin selection',
    visual_intent: 'Colorful, intuitive bin sorting',
    size: 'SMALL',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// PROGRESS TAB (Waste Segregation & Tracking)
// ============================================================================

export const PROGRESS_TAB = {
  // Section background - Reinforces segregation
  'Segregate Waste.jpg': {
    role: 'SECTION_BACKGROUND',
    section: 'Progress',
    placement: 'Full section background',
    usage: 'Reinforce proper waste segregation habits',
    visual_intent: 'Waste sorting, environmental responsibility',
    overlay_needed: true,
    overlay_opacity: 0.45,
    priority: 'HIGH'
  },
  
  // Plastic waste category
  'Plastic Recycle.jpg': {
    role: 'CATEGORY_CARD',
    section: 'Progress-Plastic',
    placement: 'Plastic segregation stats card',
    usage: 'Visual context for plastic tracking',
    visual_intent: 'Plastic lifecycle/recycling',
    priority: 'HIGH'
  },
  
  'A Green Solution for Plastic Waste_ 🌱.jpg': {
    role: 'CATEGORY_EDUCATION',
    section: 'Progress-Plastic-Education',
    placement: 'Plastic solutions info tooltip/modal',
    usage: 'Educate on plastic waste solutions',
    visual_intent: 'Green solutions, environmental hope',
    priority: 'MEDIUM'
  },
  
  // Organic waste category
  'Eco-Friendly Party Composting and Recycling.jpg': {
    role: 'CATEGORY_CARD',
    section: 'Progress-Organic',
    placement: 'Organic waste stats card',
    usage: 'Visual context for composting/organic waste',
    visual_intent: 'Eco-friendly composting',
    priority: 'HIGH'
  },
  
  // E-waste category
  'Europe\'s E-Waste Solutions_ Building a Circular Economy _ Mavigadget - Blog.jpg': {
    role: 'CATEGORY_CARD',
    section: 'Progress-EWaste',
    placement: 'E-waste stats card',
    usage: 'Visual for responsible e-waste handling',
    visual_intent: 'Circular economy, responsible disposal',
    priority: 'HIGH'
  },
  
  'Recycling e-waste isn\'t just responsible—it\'s essential_.jpg': {
    role: 'CATEGORY_EDUCATION',
    section: 'Progress-EWaste-Education',
    usage: 'E-waste importance messaging',
    visual_intent: 'Environmental responsibility, urgency',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// ANALYTICS / REPORTS TAB
// ============================================================================

export const ANALYTICS_TAB = {
  // Environmental impact education
  'Think That\'s Going to Decompose_ Think Again!.jpg': {
    role: 'DATA_CONTEXT',
    section: 'Analytics-Impact',
    placement: 'Impact visualization or education section',
    usage: 'Show decomposition reality, environmental urgency',
    visual_intent: 'Educational, motivational',
    priority: 'HIGH'
  }
};

// ============================================================================
// REWARDS / ACHIEVEMENTS TAB
// ============================================================================

export const REWARDS_TAB = {
  // Section background - Circular economy, material recovery
  'Recycled Materials.jpg': {
    role: 'SECTION_BACKGROUND',
    section: 'Rewards',
    placement: 'Full section background',
    usage: 'Celebrate achievements with materials/circular economy',
    visual_intent: 'Recovered materials, value creation',
    overlay_needed: true,
    overlay_opacity: 0.45,
    priority: 'HIGH'
  },
  
  // Community impact
  'NGO doing cleanliness drive on roads_.jpg': {
    role: 'COMMUNITY_VISUAL',
    section: 'Rewards-Community',
    placement: 'Community impact badge or achievement',
    usage: 'Show collective environmental action',
    visual_intent: 'Community participation, social impact',
    priority: 'MEDIUM'
  },
  
  // Motivation/Action visual
  '🌿🔄 Every action counts! 🔄🌿.jpg': {
    role: 'MOTIVATION_VISUAL',
    section: 'Rewards-Motivation',
    placement: 'Achievement celebration or incentive section',
    usage: 'Celebrate user milestones',
    visual_intent: 'Action-oriented, environmental optimism',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// COLLECTION REQUESTS / LOGISTICS TAB (Future)
// ============================================================================

export const COLLECTION_TAB = {
  // Garbage truck - Operations imagery
  'Garbage Truck.jpg': {
    role: 'OPERATIONS_VISUAL',
    section: 'Collection',
    placement: 'Pickup scheduling/status section',
    usage: 'Show collection vehicle operations',
    visual_intent: 'Logistics, efficiency, professional service',
    priority: 'HIGH'
  },
  
  // Collection scene - Operational context
  'The image depicts a vivid, illustrated street scene during garbage collection__Main action_ Thr___.jpg': {
    role: 'OPERATIONAL_SCENE',
    section: 'Collection',
    placement: 'Collection process or service overview',
    usage: 'Illustrate complete collection ecosystem',
    visual_intent: 'Complete waste collection process',
    priority: 'MEDIUM'
  },
  
  // Smart collection systems
  'Ecube Labs - Smart waste management solution.jpg': {
    role: 'SMART_SOLUTIONS',
    section: 'Collection-Smart',
    placement: 'Smart collection system features',
    usage: 'Showcase smart IoT-enabled collection',
    visual_intent: 'Technology-driven efficiency',
    priority: 'MEDIUM'
  }
};

// ============================================================================
// EMPTY STATES / PROBLEM AWARENESS VISUALS
// ============================================================================

export const EMPTY_STATES = {
  // No data / Waste overflow problem
  'Overflowing Garbage Cans and Piles of Garbage Editorial Image - Image of dump, dramatic_ 170371130.jpg': {
    role: 'EMPTY_STATE_MOTIVATION',
    section: 'Any-Tab-Empty',
    placement: 'When no disposal data exists',
    usage: 'Motivate action by showing problem severity',
    visual_intent: 'Problem urgency, call to action',
    priority: 'MEDIUM'
  },
  
  // Unsorted waste problem
  'Unsorted and road scattered waste.jpg': {
    role: 'EMPTY_STATE_EDUCATION',
    section: 'Progress-Empty',
    placement: 'When no segregation tracked',
    usage: 'Motivate proper segregation',
    visual_intent: 'Problem illustration, learning opportunity',
    priority: 'MEDIUM'
  },
  
  // Plastic crisis awareness
  'Plastic Age - Are We Going to Survive It_.jpg': {
    role: 'AWARENESS_CAMPAIGN',
    section: 'Any-Modal-Awareness',
    placement: 'Educational modal or awareness section',
    usage: 'Build awareness of plastic crisis',
    visual_intent: 'Urgent, impactful messaging',
    priority: 'LOW'
  },
  
  // Emotional trigger (concern)
  '😞.jpg': {
    role: 'EMOTIONAL_TRIGGER',
    section: 'Awareness-Sections',
    placement: 'Problem awareness messaging',
    usage: 'Emotional engagement before call-to-action',
    visual_intent: 'Sentiment, empathy building',
    priority: 'LOW'
  }
};

// ============================================================================
// SUPPLEMENTARY / SUPPORTING VISUALS
// ============================================================================

export const SUPPORTING = {
  // Cleanliness outcome
  'Clean.jpg': {
    role: 'OUTCOME_VISUAL',
    section: 'Any-Success-State',
    placement: 'Success completion visual',
    usage: 'Show positive outcome of proper waste mgmt',
    visual_intent: 'Clean, orderly, positive outcome',
    priority: 'LOW'
  },
  
  // Eco balance visual
  'Eco.jpg': {
    role: 'BALANCE_VISUAL',
    section: 'Dashboard-Philosophy',
    placement: 'Environmental balance messaging',
    usage: 'Show ecosystem/environmental harmony',
    visual_intent: 'Ecosystem balance, sustainability',
    priority: 'LOW'
  },
  
  // Psychological benefit messaging
  '\'Decluttering and cleaning brings a sense of internal order and peace\' - psychologist _ The Citizen.jpg': {
    role: 'PSYCHOLOGICAL_BENEFIT',
    section: 'Dashboard-Wellness',
    placement: 'Habit-building or wellness messaging',
    usage: 'Connect waste management to personal wellbeing',
    visual_intent: 'Psychological benefit, wellness',
    priority: 'LOW'
  },
  
  // App/Mobile context
  'recycle app.jpg': {
    role: 'APP_REFERENCE',
    section: 'Dashboard-Mobile',
    placement: 'Mobile app cross-promotion',
    usage: 'Cross-platform app visibility',
    visual_intent: 'Mobile app ecosystem',
    priority: 'LOW'
  }
};

// ============================================================================
// UNASSIGNED / UNCLEAR PURPOSE (Generic downloads)
// ============================================================================

export const UNASSIGNED = {
  'download.jpg': {
    role: 'REVIEWER_DECISION',
    notes: 'Generic stock image - requires manual review'
  },
  'download (1).jpg': {
    role: 'REVIEWER_DECISION',
    notes: 'Generic stock image - requires manual review'
  }
};

// ============================================================================
// IMAGE USAGE SUMMARY BY SECTION
// ============================================================================

export const SECTION_MAPPING = {
  'Header/Navigation': [
    'Main Logo.jpg',
    'Logo 2.jpg'
  ],
  'Landing Page': [
    'save earth.jpg',
    'Green Tech_ Innovating for a Sustainable Future!.jpg',
    '🌿🔄 Every action counts! 🔄🌿.jpg',
    'Sustainable Waste Management Solutions for Corporates in India.jpg'
  ],
  'Authentication': [
    'save earth.jpg',
    'Main Logo.jpg'
  ],
  'Dashboard Home': [
    'Smart Waste Management means profit & sustainability.jpg',
    'Smart EcoBin_ Your Effortless Recycling Ally.jpg',
    'turn waste to wealth.jpg',
    'Artificial Intelligence in Predictive Waste Collection - Reducing Overflow and Costs in Dubai.jpg',
    'Ecology Mobile App UX and UI Kit.jpg'
  ],
  'Scan Tab': [
    'Smart EcoBin_ Your Effortless Recycling Ally.jpg',
    'Download premium psd _ image of Yellow trash with a recycle symbol about yellow trash bin, recycling bin yellow, recycled bin, recycling bin, and white dustbin 475857.jpg'
  ],
  'Progress Tab': [
    'Segregate Waste.jpg',
    'Plastic Recycle.jpg',
    'A Green Solution for Plastic Waste_ 🌱.jpg',
    'Eco-Friendly Party Composting and Recycling.jpg',
    'Europe\'s E-Waste Solutions_ Building a Circular Economy _ Mavigadget - Blog.jpg',
    'Recycling e-waste isn\'t just responsible—it\'s essential_.jpg'
  ],
  'Analytics Tab': [
    'Think That\'s Going to Decompose_ Think Again!.jpg'
  ],
  'Rewards Tab': [
    'Recycled Materials.jpg',
    'NGO doing cleanliness drive on roads_.jpg',
    '🌿🔄 Every action counts! 🔄🌿.jpg'
  ],
  'Collection Tab': [
    'Garbage Truck.jpg',
    'The image depicts a vivid, illustrated street scene during garbage collection__Main action_ Thr___.jpg',
    'Ecube Labs - Smart waste management solution.jpg'
  ],
  'Empty States': [
    'Overflowing Garbage Cans and Piles of Garbage Editorial Image - Image of dump, dramatic_ 170371130.jpg',
    'Unsorted and road scattered waste.jpg',
    'Plastic Age - Are We Going to Survive It_.jpg'
  ],
  'Supporting/Accents': [
    'Clean.jpg',
    'Eco.jpg',
    '\'Decluttering and cleaning brings a sense of internal order and peace\' - psychologist _ The Citizen.jpg',
    'recycle app.jpg'
  ]
};

// ============================================================================
// EXPORT ORGANIZED BY PRIORITY
// ============================================================================

export default {
  BRANDING,
  LANDING_PAGE,
  AUTH_PAGES,
  DASHBOARD_HOME,
  SCAN_TAB,
  PROGRESS_TAB,
  ANALYTICS_TAB,
  REWARDS_TAB,
  COLLECTION_TAB,
  EMPTY_STATES,
  SUPPORTING,
  SECTION_MAPPING
};
