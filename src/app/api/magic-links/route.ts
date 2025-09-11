import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface MagicLinkRequest {
  email: string;
  userType: 'franchisee' | 'technician';
  userId: number;
  name: string;
  franchiseName?: string;
  territory?: string;
}

const magicLinks = new Map<string, {
  email: string;
  userType: 'franchisee' | 'technician';
  userId: number;
  name: string;
  expiresAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const { email, userType, userId, name, franchiseName, territory }: MagicLinkRequest = await request.json();

    if (!email || !userType || !userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    magicLinks.set(token, {
      email,
      userType,
      userId,
      name,
      expiresAt,
    });

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/magic?token=${token}`;

    const territoryInfo = territory ? ` (${territory})` : '';
    const franchiseInfo = franchiseName && franchiseName !== name ? ` for ${franchiseName}` : '';

    const emailContent = `
      <h2>Welcome to Pop-A-Lock Management Portal</h2>
      <p>Hi ${name},</p>
      <p>You have been granted access to the Pop-A-Lock ${userType} dashboard${franchiseInfo}${territoryInfo}.</p>
      <p>Click the link below to securely access your dashboard:</p>
      <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Access ${userType === 'franchisee' ? 'Franchisee' : 'Technician'} Dashboard
      </a>
      <p><strong>Important:</strong> This secure link will expire in 24 hours for security purposes.</p>
      <p>What you can do in your dashboard:</p>
      <ul>
        ${userType === 'franchisee' 
          ? '<li>Manage your franchise operations</li><li>View technician performance</li><li>Access reports and analytics</li><li>Manage job assignments</li>' 
          : '<li>Submit job photos and reports</li><li>View your performance metrics</li><li>Access job details</li><li>Update job status</li>'
        }
      </ul>
      <p>If you didn't request this access or have any questions, please contact your administrator.</p>
      <p>Best regards,<br>Pop-A-Lock Management Team</p>
    `;

    console.log(`\n🔐 MAGIC LINK GENERATED`);
    console.log(`📧 Recipient: ${name} (${email})`);
    console.log(`🏢 Franchise: ${franchiseName || 'N/A'}${territoryInfo}`);
    console.log(`🔗 Link: ${magicLink}`);
    console.log(`⏰ Expires: ${expiresAt.toLocaleString()}`);
    console.log(`📝 User Type: ${userType}`);
    console.log(`\n📧 EMAIL CONTENT:\n${emailContent}\n`);

    return NextResponse.json({
      success: true,
      message: `Magic link sent to ${email}`,
      magicLink,
      emailContent,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating magic link:', error);
    return NextResponse.json(
      { error: 'Failed to generate magic link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  const linkData = magicLinks.get(token);

  if (!linkData) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  if (linkData.expiresAt < new Date()) {
    magicLinks.delete(token);
    return NextResponse.json(
      { error: 'Token has expired' },
      { status: 401 }
    );
  }

  magicLinks.delete(token);

  return NextResponse.json({
    success: true,
    user: {
      email: linkData.email,
      userType: linkData.userType,
      userId: linkData.userId,
      name: linkData.name,
    },
  });
}