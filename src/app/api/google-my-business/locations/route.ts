import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseeId = searchParams.get('franchisee_id');
    
    if (!franchiseeId) {
      return NextResponse.json(
        { error: 'Franchisee ID is required' },
        { status: 400 }
      );
    }

    // TODO: Get stored access token from database
    // const tokens = await getGMBTokens(franchiseeId);
    // For now, return mock data
    
    const mockLocations = [
      {
        name: "accounts/12345/locations/67890",
        locationName: "Pop-A-Lock Downtown",
        primaryAddress: {
          addressLines: ["123 Main St"],
          locality: "Your City",
          administrativeArea: "State",
          postalCode: "12345",
          regionCode: "US"
        },
        primaryPhone: "+1-555-123-4567",
        websiteUri: "https://popalock.com",
        categories: {
          primaryCategory: {
            categoryId: "gcid:locksmith"
          }
        }
      }
    ];

    return NextResponse.json({
      success: true,
      locations: mockLocations
    });

  } catch (error) {
    console.error('GMB Locations API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get GMB locations' },
      { status: 500 }
    );
  }
}

// Helper function to get locations with real access token
async function getGMBLocationsWithToken(accessToken: string) {
  try {
    // Get accounts first
    const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!accountsResponse.ok) {
      throw new Error(`Accounts API error: ${accountsResponse.statusText}`);
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];
    
    if (accounts.length === 0) {
      return { success: true, locations: [] };
    }

    // Get locations for each account
    const allLocations = [];
    for (const account of accounts) {
      const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        const locations = locationsData.locations || [];
        allLocations.push(...locations);
      }
    }

    return { success: true, locations: allLocations };
  } catch (error) {
    console.error('Error getting GMB locations:', error);
    return { success: false, error: error.message };
  }
}