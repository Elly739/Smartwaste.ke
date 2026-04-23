/**
 * SmartWaste MVP - Complete Image Asset Library
 * 
 * STRATEGIC ORGANIZATION BY USE CASE
 * All images from /public/Images folder systematically assigned to platform sections
 * See IMAGE_MAPPING_STRATEGY.js for detailed role definitions
 */

// ============================================================================
// BRANDING ASSETS - CRITICAL FOR BRAND CONSISTENCY
// ============================================================================

export const brandingAssets = {
  primaryLogo: '/Images/Main Logo.jpg',        // Header and primary branding
  secondaryLogo: '/Images/Logo 2.jpg',         // Sidebar and alternates
  tertiaryLogo: '/Images/Logo 3.jpg',          // Icon-only contexts
};

// ============================================================================
// LANDING PAGE - HERO & CTA SECTIONS
// ============================================================================

export const landingPageImages = {
  // Hero section - Above the fold, high-impact
  heroBackground: '/Images/save earth.jpg',
  
  // Features highlight - Innovation messaging
  innovationFeature: '/Images/Green Tech_ Innovating for a Sustainable Future!.jpg',
  
  // Call-to-action visual
  ctaMotivation: '/Images/🌿🔄 Every action counts! 🔄🌿.jpg',
  
  // Corporate/social proof section
  corporateSolution: '/Images/Sustainable Waste Management Solutions for Corporates in India.jpg',
};

// ============================================================================
// AUTHENTICATION PAGES (Login/Register/Reset)
// ============================================================================

export const authenticationImages = {
  // Side illustration for login/register
  authBackground: '/Images/save earth.jpg',
  
  // Logo placement
  authLogo: '/Images/Main Logo.jpg',
};

// ============================================================================
// DASHBOARD HOME / OVERVIEW SECTION
// ============================================================================

export const dashboardHomeImages = {
  // KPI/Metrics section background - Business + sustainability
  statsSectionBackground: '/Images/Smart Waste Management means profit & sustainability.jpg',
  
  // Smart solutions feature showcase
  smartSolutionsCard: '/Images/Smart EcoBin_ Your Effortless Recycling Ally.jpg',
  
  // Value proposition - Circular economy
  valueProposition: '/Images/turn waste to wealth.jpg',
  
  // AI/Intelligence features
  aiTechnology: '/Images/Artificial Intelligence in Predictive Waste Collection - Reducing Overflow and Costs in Dubai.jpg',
  
  // App concept/features overview
  appUIKit: '/Images/Ecology Mobile App UX and UI Kit.jpg',
};

// ============================================================================
// SCAN TAB - QR CODE & BIN SELECTION
// ============================================================================

export const scanTabImages = {
  // Section background - Contextual smart bin visual
  sectionBackground: '/Images/Smart EcoBin_ Your Effortless Recycling Ally.jpg',
  
  // Inline instruction illustration - Colorful bin options
  binIllustration: '/Images/Download premium psd _ image of Yellow trash with a recycle symbol about yellow trash bin, recycling bin yellow, recycled bin, recycling bin, and white dustbin 475857.jpg',
};

// ============================================================================
// PROGRESS TAB - WASTE SEGREGATION & TRACKING
// ============================================================================

export const progressTabImages = {
  // Section background - Reinforces segregation importance
  sectionBackground: '/Images/Segregate Waste.jpg',
  
  // PLASTIC WASTE CATEGORY
  plasticStats: '/Images/Plastic Recycle.jpg',
  plasticEducation: '/Images/A Green Solution for Plastic Waste_ 🌱.jpg',
  
  // ORGANIC WASTE CATEGORY
  organicStats: '/Images/Eco-Friendly Party Composting and Recycling.jpg',
  
  // E-WASTE CATEGORY
  eWasteStats: '/Images/Europe\'s E-Waste Solutions_ Building a Circular Economy _ Mavigadget - Blog.jpg',
  eWasteEducation: '/Images/Recycling e-waste isn\'t just responsible—it\'s essential_.jpg',
};

// ============================================================================
// ANALYTICS / REPORTS TAB
// ============================================================================

export const analyticsTabImages = {
  // Environmental impact context - Educational
  impactVisualization: '/Images/Think That\'s Going to Decompose_ Think Again!.jpg',
};

// ============================================================================
// REWARDS / ACHIEVEMENTS TAB
// ============================================================================

export const rewardsTabImages = {
  // Section background - Circular economy & material recovery
  sectionBackground: '/Images/Recycled Materials.jpg',
  
  // Community impact badge
  communityImpact: '/Images/NGO doing cleanliness drive on roads_.jpg',
  
  // Achievement motivation
  motivationVisual: '/Images/🌿🔄 Every action counts! 🔄🌿.jpg',
};

// ============================================================================
// COLLECTION REQUESTS / LOGISTICS (Future Feature)
// ============================================================================

export const collectionTabImages = {
  // Vehicle operations
  collectionVehicle: '/Images/Garbage Truck.jpg',
  
  // Operational process illustration
  collectionScene: '/Images/The image depicts a vivid, illustrated street scene during garbage collection__Main action_ Thr___.jpg',
  
  // Smart IoT collection systems
  smartCollection: '/Images/Ecube Labs - Smart waste management solution.jpg',
};

// ============================================================================
// EMPTY STATES - PROBLEM AWARENESS FOR MOTIVATION
// ============================================================================

export const emptyStateImages = {
  // When no disposal data - Show problem severity
  wasteOverflow: '/Images/Overflowing Garbage Cans and Piles of Garbage Editorial Image - Image of dump, dramatic_ 170371130.jpg',
  
  // When no segregation tracked - Motivate action
  unsortedWaste: '/Images/Unsorted and road scattered waste.jpg',
  
  // Awareness campaigns - Plastic crisis
  plasticCrisis: '/Images/Plastic Age - Are We Going to Survive It_.jpg',
};

// ============================================================================
// SUPPORTING / ACCENT VISUALS
// ============================================================================

export const supportiveImages = {
  // Success state outcome - Clean environment
  cleanOutcome: '/Images/Clean.jpg',
  
  // Ecosystem balance visual
  ecoBalance: '/Images/Eco.jpg',
  
  // Psychological benefit messaging
  wellnessMessage: '/Images/\'Decluttering and cleaning brings a sense of internal order and peace\' - psychologist _ The Citizen.jpg',
  
  // Mobile app ecosystem
  mobileAppContext: '/Images/recycle app.jpg',
  
  // Emotional trigger for awareness
  sentimentConcern: '/Images/😞.jpg',
};

// ============================================================================
// BACKWARD COMPATIBLE EXPORTS (For existing App.jsx imports)
// ============================================================================

export const SectionBackgrounds = {
  scan: scanTabImages.sectionBackground,
  progress: progressTabImages.sectionBackground,
  rewards: rewardsTabImages.sectionBackground,
  admin: dashboardHomeImages.statsSectionBackground,
};

export const HeroImages = {
  auth: authenticationImages.authBackground,
  impact: landingPageImages.heroBackground,
  brandMark: brandingAssets.primaryLogo,
};

export const ContextualImages = {
  plastic: progressTabImages.plasticStats,
  eWaste: progressTabImages.eWasteStats,
  composting: progressTabImages.organicStats,
  collectionTruck: collectionTabImages.collectionVehicle,
  smartCollection: collectionTabImages.smartCollection,
  recycleProcess: progressTabImages.plasticEducation,
  decomposition: analyticsTabImages.impactVisualization,
  ewasteResponsibility: progressTabImages.eWasteEducation,
};

export const ProblemVisuals = {
  wasteOverflow: emptyStateImages.wasteOverflow,
  unsortedWaste: emptyStateImages.unsortedWaste,
  plasticAwareness: emptyStateImages.plasticCrisis,
};

export const ImpactVisuals = {
  wasteToWealth: landingPageImages.valueProposition,
  greenTech: landingPageImages.innovationFeature,
  ecoAction: landingPageImages.ctaMotivation,
  cleaningDrive: rewardsTabImages.communityImpact,
  aiWasteTech: dashboardHomeImages.aiTechnology,
};

// ============================================================================
// ORGANIZED EXPORTS BY SECTION (Easy Component Access)
// ============================================================================

export const imagesBySection = {
  branding: brandingAssets,
  landingPage: landingPageImages,
  authentication: authenticationImages,
  dashboardHome: dashboardHomeImages,
  scanTab: scanTabImages,
  progressTab: progressTabImages,
  analyticsTab: analyticsTabImages,
  rewardsTab: rewardsTabImages,
  collectionTab: collectionTabImages,
  emptyStates: emptyStateImages,
  supportive: supportiveImages,
};

// ============================================================================
// FLAT EXPORT - All images in single object
// ============================================================================

export default {
  // Backward compatible category exports
  SectionBackgrounds,
  HeroImages,
  ContextualImages,
  ProblemVisuals,
  ImpactVisuals,
  
  // Organized by section
  ...imagesBySection,
  
  // Brand
  primaryLogo: brandingAssets.primaryLogo,
  secondaryLogo: brandingAssets.secondaryLogo,
  tertiaryLogo: brandingAssets.tertiaryLogo,
  
  // Landing
  heroBackground: landingPageImages.heroBackground,
  innovationFeature: landingPageImages.innovationFeature,
  ctaMotivation: landingPageImages.ctaMotivation,
  corporateSolution: landingPageImages.corporateSolution,
  
  // Auth
  authBackground: authenticationImages.authBackground,
  authLogo: authenticationImages.authLogo,
  
  // Dashboard
  statsSectionBackground: dashboardHomeImages.statsSectionBackground,
  smartSolutionsCard: dashboardHomeImages.smartSolutionsCard,
  valueProposition: dashboardHomeImages.valueProposition,
  aiTechnology: dashboardHomeImages.aiTechnology,
  appUIKit: dashboardHomeImages.appUIKit,
  
  // Scan
  scanSectionBackground: scanTabImages.sectionBackground,
  binIllustration: scanTabImages.binIllustration,
  
  // Progress
  progressSectionBackground: progressTabImages.sectionBackground,
  plasticStats: progressTabImages.plasticStats,
  plasticEducation: progressTabImages.plasticEducation,
  organicStats: progressTabImages.organicStats,
  eWasteStats: progressTabImages.eWasteStats,
  eWasteEducation: progressTabImages.eWasteEducation,
  
  // Analytics
  impactVisualization: analyticsTabImages.impactVisualization,
  
  // Rewards
  rewardsSectionBackground: rewardsTabImages.sectionBackground,
  communityImpact: rewardsTabImages.communityImpact,
  motivationVisual: rewardsTabImages.motivationVisual,
  
  // Collection
  collectionVehicle: collectionTabImages.collectionVehicle,
  collectionScene: collectionTabImages.collectionScene,
  smartCollection: collectionTabImages.smartCollection,
  
  // Empty States
  wasteOverflow: emptyStateImages.wasteOverflow,
  unsortedWaste: emptyStateImages.unsortedWaste,
  plasticCrisis: emptyStateImages.plasticCrisis,
  
  // Supporting
  cleanOutcome: supportiveImages.cleanOutcome,
  ecoBalance: supportiveImages.ecoBalance,
  wellnessMessage: supportiveImages.wellnessMessage,
  mobileAppContext: supportiveImages.mobileAppContext,
  sentimentConcern: supportiveImages.sentimentConcern,
};

