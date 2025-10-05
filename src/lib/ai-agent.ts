/**
 * Pop-A-Lock AI Agent for GMB Post Generation
 * Specialized in creating service-specific content for Auto, Residential, Commercial, and Roadside
 */

export interface ServiceContext {
  serviceType: 'Automotive' | 'Residential' | 'Commercial' | 'Roadside';
  jobDescription: string;
  location: string;
  techName: string;
  notes?: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
}

export interface PostOptions {
  postType: 'success-stories' | 'tips-tricks' | 'behind-scenes' | 'before-after' | 'educational' | 'promotional';
  additionalDetails?: string;
}

export class PopALockAIAgent {
  private serviceExpertise = {
    Automotive: {
      keywords: ['car lockout', 'key replacement', 'ignition repair', 'transponder key', 'automotive locksmith', 'vehicle security'],
      commonScenarios: ['locked keys in car', 'broken car key', 'lost car keys', 'key fob programming', 'ignition issues'],
      callToAction: 'Call us 24/7 for fast automotive locksmith services',
      expertise: 'automotive locksmith specialists with advanced key programming technology'
    },
    Residential: {
      keywords: ['home lockout', 'lock installation', 'rekey service', 'smart locks', 'home security', 'deadbolt'],
      commonScenarios: ['locked out of home', 'moving security', 'lock upgrade', 'key duplication', 'master key systems'],
      callToAction: 'Protect your home with professional locksmith services',
      expertise: 'residential security experts with certified lock installation'
    },
    Commercial: {
      keywords: ['commercial locks', 'access control', 'master key system', 'panic hardware', 'office security'],
      commonScenarios: ['business lockout', 'employee turnover rekey', 'access system upgrade', 'high-security locks'],
      callToAction: 'Secure your business with commercial-grade locksmith solutions',
      expertise: 'commercial security specialists serving businesses of all sizes'
    },
    Roadside: {
      keywords: ['roadside assistance', 'emergency lockout', 'mobile service', '24/7 response', 'on-site service'],
      commonScenarios: ['stranded driver', 'parking lot lockout', 'highway emergency', 'quick response needed'],
      callToAction: 'Fast roadside locksmith service when you need it most',
      expertise: 'mobile locksmith specialists with rapid response times'
    }
  };

  /**
   * Generate GMB post content using AI agent logic
   */
  async generatePost(context: ServiceContext, options: PostOptions): Promise<string> {
    const expertise = this.serviceExpertise[context.serviceType];
    const vehicleInfo = this.getVehicleInfo(context);

    switch (options.postType) {
      case 'success-stories':
        return this.generateSuccessStory(context, expertise, vehicleInfo, options.additionalDetails);

      case 'tips-tricks':
        return this.generateTipsAndTricks(context, expertise, vehicleInfo, options.additionalDetails);

      case 'educational':
        return this.generateEducational(context, expertise, vehicleInfo, options.additionalDetails);

      case 'behind-scenes':
        return this.generateBehindTheScenes(context, expertise, vehicleInfo, options.additionalDetails);

      case 'before-after':
        return this.generateBeforeAfter(context, expertise, vehicleInfo, options.additionalDetails);

      case 'promotional':
        return this.generatePromotional(context, expertise, vehicleInfo, options.additionalDetails);

      default:
        return this.generateGenericPost(context, expertise, vehicleInfo, options.additionalDetails);
    }
  }

  private getVehicleInfo(context: ServiceContext): string | null {
    if (context.serviceType === 'Automotive' && (context.vehicleYear || context.vehicleMake || context.vehicleModel)) {
      return [context.vehicleYear, context.vehicleMake, context.vehicleModel].filter(Boolean).join(' ');
    }
    return null;
  }

  private generateSuccessStory(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const vehicleText = vehicleInfo ? ` for a ${vehicleInfo}` : '';
    const detailsText = details ? `\n\n${details}` : '';

    return `Another successful ${context.serviceType} service completed in ${context.location}!

Our technician ${context.techName} provided expert ${context.jobDescription.toLowerCase()} service${vehicleText}.${detailsText}

As ${expertise.expertise}, we ensure every job is completed with precision and care.

${expertise.callToAction}.

Service: ${context.serviceType}
Location: ${context.location}
Technician: ${context.techName}`;
  }

  private generateTipsAndTricks(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const tip = details || `Regular maintenance can prevent most ${context.serviceType.toLowerCase()} lock issues and save you money in the long run.`;
    const vehicleTipText = vehicleInfo ? ` This tip is especially important for ${vehicleInfo} owners and similar vehicles.` : '';

    return `Professional Locksmith Tip

${tip}${vehicleTipText}

Based on our recent ${context.serviceType} service in ${context.location}, here's what you should know:

- Check your locks monthly for wear and tear
- Lubricate mechanisms every 6 months
- Replace worn keys before they break
- ${this.getServiceSpecificTip(context.serviceType)}

Expert advice from ${context.techName}, one of our certified ${expertise.expertise}.

${expertise.callToAction}.`;
  }

  private generateEducational(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const educationalContent = details || `Did you know? Most ${context.serviceType.toLowerCase()} security issues can be prevented with proper lock maintenance.`;
    const vehicleText = vehicleInfo ? ` Recent service on a ${vehicleInfo} highlighted this important information.` : '';

    return `Security Education

${educationalContent}${vehicleText}

After our ${context.serviceType} service in ${context.location}, we want to share these important security facts:

${this.getEducationalFacts(context.serviceType)}

Your security is our priority. Trust ${expertise.expertise} for all your ${context.serviceType.toLowerCase()} locksmith needs.

${expertise.callToAction}.`;
  }

  private generateBehindTheScenes(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const behindScenesText = details || `See how our expert technicians handle ${context.serviceType.toLowerCase()} locksmith services with precision and care.`;
    const vehicleText = vehicleInfo ? ` Today's service: ${vehicleInfo}` : '';

    return `Behind the Scenes

${behindScenesText}${vehicleText}

Our technician ${context.techName} recently completed a ${context.jobDescription} service in ${context.location}, showcasing the professional expertise that makes Pop-A-Lock the trusted choice.

What sets us apart:
- Advanced tools and technology
- Certified and experienced technicians
- Commitment to customer satisfaction
- Fast, reliable service

${expertise.callToAction}.`;
  }

  private generateBeforeAfter(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const transformationText = details || `See the transformation from a security concern to complete peace of mind.`;
    const vehicleText = vehicleInfo ? ` Vehicle: ${vehicleInfo}` : '';

    return `Before & After Transformation

${transformationText}

Service provided: ${context.jobDescription}
Location: ${context.location}
Technician: ${context.techName}${vehicleText}

From problem to solution, our ${expertise.expertise} deliver results you can trust.

${expertise.callToAction}.`;
  }

  private generatePromotional(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const promoText = details || `Professional ${context.serviceType} locksmith services in ${context.location} and surrounding areas.`;
    const vehicleText = vehicleInfo ? ` Recent service included ${vehicleInfo} - we handle all makes and models!` : '';

    return `${promoText}${vehicleText}

Our experienced team provides:
- ${context.serviceType} locksmith services
- Emergency 24/7 availability
- Licensed and insured professionals
- Upfront pricing with no hidden fees
${context.serviceType === 'Automotive' ? '- All vehicle makes and models supported' : ''}

Recent service by ${context.techName} - another satisfied customer!

${expertise.callToAction}.`;
  }

  private generateGenericPost(context: ServiceContext, expertise: any, vehicleInfo: string | null, details?: string): string {
    const vehicleText = vehicleInfo ? ` for ${vehicleInfo}` : '';
    const detailsText = details ? `\n\n${details}` : '';

    return `Professional ${context.serviceType} locksmith service in ${context.location}!

Service: ${context.jobDescription}${vehicleText}
Technician: ${context.techName}${detailsText}

${expertise.callToAction}.`;
  }

  private getServiceSpecificTip(serviceType: string): string {
    const tips = {
      Automotive: 'Keep a spare key in a secure location outside your vehicle',
      Residential: 'Upgrade to high-security deadbolts for better protection',
      Commercial: 'Implement access control systems for employee management',
      Roadside: 'Save our number for 24/7 emergency assistance'
    };
    return tips[serviceType as keyof typeof tips] || 'Contact us for professional security advice';
  }

  private getEducationalFacts(serviceType: string): string {
    const facts = {
      Automotive: `- Modern vehicle security systems require professional programming
- Regular key fob battery replacement prevents lockouts
- Transponder keys contain encrypted chips for security
- Ignition cylinder wear can cause starting issues`,

      Residential: `- 60% of burglars enter through unlocked doors
- Quality locks deter 90% of opportunistic crimes
- Regular lock maintenance extends lifespan by 70%
- Smart locks offer convenience without sacrificing security`,

      Commercial: `- Employee turnover requires immediate rekeying for security
- Master key systems provide flexible access control
- Panic hardware ensures safe emergency exits
- Regular security audits prevent unauthorized access`,

      Roadside: `- Most lockouts occur in parking lots and at home
- Mobile locksmiths arrive faster than towing services
- Professional tools prevent vehicle damage during lockouts
- 24/7 availability means help is always ready`
    };
    return facts[serviceType as keyof typeof facts] || 'Security is our top priority.';
  }

  /**
   * Optimize content for Google My Business posting rules
   */
  optimizeForGMB(content: string): string {
    // Remove emojis
    let optimized = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    // Remove hashtags
    optimized = optimized.replace(/#\w+/g, '');

    // Remove @ mentions
    optimized = optimized.replace(/@\w+/g, '');

    // Clean up excessive whitespace
    optimized = optimized.replace(/\n{3,}/g, '\n\n');
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.trim();

    // Ensure proper line breaks
    optimized = optimized.replace(/\. ([A-Z])/g, '.\n\n$1');

    return optimized;
  }
}

// Singleton instance
export const popALockAI = new PopALockAIAgent();
