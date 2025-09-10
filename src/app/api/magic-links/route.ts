import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface MagicLinkRequest {
  email: string;
  userType: 'franchisee' | 'technician';
  userId: number;
  name: string;
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
    const { email, userType, userId, name }: MagicLinkRequest = await request.json();

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

    const emailContent = `
      <h2>Welcome to Pop-A-Lock Management Portal</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to securely access your ${userType} dashboard:</p>
      <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Access Dashboard
      </a>
      <p>This link will expire in 24 hours for security purposes.</p>
      <p>If you didn't request this access, please ignore this email.</p>
      <p>Best regards,<br>Pop-A-Lock Management Team</p>
    `;

    console.log(`Magic link generated for ${name} (${email}): ${magicLink}`);
    console.log('Email content:', emailContent);

    return NextResponse.json({
      success: true,
      message: `Magic link sent to ${email}`,
      magicLink,
      emailContent,
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