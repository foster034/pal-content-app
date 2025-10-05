import { NextRequest, NextResponse } from 'next/server';
import { getGMBTokens } from '@/lib/gmb-tokens';

export async function POST(request: NextRequest) {
  try {
    const { franchiseeId, summary, media, topicType } = await request.json();

    if (!franchiseeId || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: franchiseeId, summary' },
        { status: 400 }
      );
    }

    console.log('Creating GMB post for franchisee:', franchiseeId);

    // Get stored access token from database
    const tokenResult = await getGMBTokens(franchiseeId);

    if (!tokenResult.success || !tokenResult.data) {
      return NextResponse.json(
        { error: 'GMB account not connected. Please connect Google My Business in settings.' },
        { status: 404 }
      );
    }

    const { access_token, selected_location_name } = tokenResult.data;

    if (!selected_location_name) {
      return NextResponse.json(
        { error: 'No default location selected. Please select a location in GMB settings.' },
        { status: 400 }
      );
    }

    // Create the GMB post
    const result = await createGMBPost(access_token, selected_location_name, summary, media, topicType);

    if (result.success) {
      return NextResponse.json({
        success: true,
        postName: result.data.name,
        message: 'Post created successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create GMB post' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('GMB Post Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create GMB post', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create actual GMB post
async function createGMBPost(
  accessToken: string,
  locationName: string,
  summary: string,
  media?: Array<{ mediaFormat: string; sourceUrl: string }>,
  topicType?: string
) {
  try {
    const postData: any = {
      languageCode: 'en-US',
      summary: summary,
      topicType: topicType || 'STANDARD',
    };

    // Add media if provided
    if (media && media.length > 0) {
      postData.media = media;
    }

    console.log('Posting to GMB:', locationName);
    console.log('Post data:', JSON.stringify(postData, null, 2));

    // The correct API endpoint for creating posts
    const apiUrl = `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`;

    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GMB Post API Error:', response.status, errorText);

      if (response.status === 403) {
        return { success: false, error: 'quota exceeded or API not approved. Check GOOGLE_SETUP.md for approval status.' };
      }

      throw new Error(`GMB API Error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('GMB Post created:', result.name);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error creating GMB post:', error);
    return { success: false, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseeId = searchParams.get('franchisee_id');
    const locationName = searchParams.get('location_name');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching GMB posts for franchisee:', franchiseeId, 'limit:', limit);

    // TODO: Get stored access token and fetch real posts
    // For now, return enhanced mock data with more realistic posts
    const mockPosts = [
      {
        name: "accounts/12345/locations/67890/localPosts/1",
        languageCode: "en-US",
        summary: "🔒 Just completed a master key installation for Dallas Office Complex! Our commercial locksmith team ensures your business stays secure 24/7. #CommercialLocksmith #MasterKey #Dallas #PopALock",
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        state: "LIVE",
        callToAction: {
          actionType: "CALL_NOW",
          url: "tel:+15551234567"
        },
        media: [{
          mediaFormat: "PHOTO",
          sourceUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format"
        }],
        insights: {
          viewsCount: 156,
          actionsCount: 12
        }
      },
      {
        name: "accounts/12345/locations/67890/localPosts/2",
        languageCode: "en-US", 
        summary: "🚗 Emergency car lockout resolved in under 30 minutes! Our automotive specialists are available 24/7 for roadside assistance. Fast, reliable, and affordable service. #CarLockout #Automotive #Emergency #PopALock",
        createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        state: "LIVE",
        callToAction: {
          actionType: "LEARN_MORE",
          url: "https://popalock.com/automotive"
        },
        media: [{
          mediaFormat: "PHOTO", 
          sourceUrl: "https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=400&fit=crop&auto=format"
        }],
        insights: {
          viewsCount: 203,
          actionsCount: 18
        }
      },
      {
        name: "accounts/12345/locations/67890/localPosts/3",
        languageCode: "en-US",
        summary: "🏠 Smart lock installation complete! Modern security technology for your home. Our residential locksmith services include traditional and digital solutions. Contact us today! #SmartLock #Residential #HomeSecurity #PopALock",
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        state: "LIVE",
        callToAction: {
          actionType: "BOOK_APPOINTMENT",
          url: "https://popalock.com/book"
        },
        media: [{
          mediaFormat: "PHOTO",
          sourceUrl: "https://images.unsplash.com/photo-1544860565-d4c4d73cb237?w=400&h=400&fit=crop&auto=format"
        }],
        insights: {
          viewsCount: 89,
          actionsCount: 7
        }
      },
      {
        name: "accounts/12345/locations/67890/localPosts/4",
        languageCode: "en-US",
        summary: "✨ Another satisfied customer! Professional home rekey service completed in Dallas. When you need reliable locksmith services, we're here to help. Licensed, bonded, and insured. #HomeRekey #Residential #Dallas #PopALock",
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        state: "LIVE",
        callToAction: {
          actionType: "CALL_NOW",
          url: "tel:+15551234567"
        },
        media: [{
          mediaFormat: "PHOTO",
          sourceUrl: "https://images.unsplash.com/photo-1566471307885-a33cd0d7c6af?w=400&h=400&fit=crop&auto=format"
        }],
        insights: {
          viewsCount: 134,
          actionsCount: 9
        }
      },
      {
        name: "accounts/12345/locations/67890/localPosts/5",
        languageCode: "en-US",
        summary: "🚨 24/7 Emergency Locksmith Services Available! Locked out? We're here to help day or night. Fast response times and professional service guaranteed. #Emergency #24x7 #Locksmith #PopALock",
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        updateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        state: "LIVE",
        callToAction: {
          actionType: "CALL_NOW",
          url: "tel:+15551234567"
        },
        insights: {
          viewsCount: 298,
          actionsCount: 23
        }
      }
    ];

    // Apply limit
    const limitedPosts = mockPosts.slice(0, limit);

    return NextResponse.json({
      success: true,
      posts: limitedPosts,
      total: mockPosts.length,
      location: locationName || "Pop-A-Lock Downtown"
    });

  } catch (error) {
    console.error('GMB Posts GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get GMB posts' },
      { status: 500 }
    );
  }
}