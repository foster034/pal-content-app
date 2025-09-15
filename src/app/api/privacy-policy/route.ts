import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const privacyPolicy = {
      lastUpdated: '2025-09-13',
      version: '1.0',
      content: {
        title: 'Pop-A-Lock Privacy Policy',
        sections: [
          {
            title: 'Information We Collect',
            content: `We collect information you provide directly to us, such as when you:
            • Request locksmith services
            • Provide contact information for service completion notifications
            • Give consent for us to contact you about your service
            • Leave reviews or testimonials about our services
            
            This may include your name, phone number, email address, service location, and photos of completed work.`
          },
          {
            title: 'How We Use Your Information',
            content: `We use the information we collect to:
            • Provide and complete locksmith services
            • Send you notifications about service completion
            • Request feedback and reviews
            • Improve our services
            • Comply with legal obligations
            
            We will only contact you via your preferred method (phone, email, or SMS) and only with your explicit consent.`
          },
          {
            title: 'Information Sharing',
            content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only:
            • With your explicit consent (e.g., when you authorize us to share photos or testimonials)
            • To comply with legal requirements
            • To protect our rights and property
            • With service providers who assist us in our operations (under strict confidentiality agreements)`
          },
          {
            title: 'Your Rights and Choices',
            content: `You have the right to:
            • Access your personal information
            • Correct inaccurate information
            • Request deletion of your information
            • Withdraw consent for communications
            • Opt out of marketing communications
            
            To exercise these rights, contact us using the information provided below.`
          },
          {
            title: 'Data Security',
            content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.`
          },
          {
            title: 'Contact Information',
            content: `If you have questions about this privacy policy or our privacy practices, please contact us:
            
            Pop-A-Lock Franchise Management
            Email: privacy@popalock.com
            Phone: 1-800-POP-LOCK
            
            For immediate privacy concerns related to your service, contact your local franchisee directly.`
          }
        ]
      },
      consentTypes: {
        contact: {
          title: 'Service Communication Consent',
          description: 'I consent to being contacted about this service via my preferred method.',
          required: true
        },
        share: {
          title: 'Content Sharing Consent', 
          description: 'I consent to Pop-A-Lock using photos and information from my service for marketing purposes.',
          required: false
        },
        marketing: {
          title: 'Marketing Communications',
          description: 'I consent to receiving promotional communications about Pop-A-Lock services.',
          required: false
        }
      }
    };

    return NextResponse.json({
      success: true,
      privacyPolicy
    });

  } catch (error) {
    console.error('Error retrieving privacy policy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}