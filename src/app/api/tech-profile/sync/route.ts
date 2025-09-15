import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { techId, updates } = await request.json();
    
    if (!techId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      );
    }

    console.log('Syncing tech profile updates:', { techId, updates });

    // In a real application, this would:
    // 1. Update the tech profile database
    // 2. Sync with Tech Hub user data
    // 3. Update login credentials system
    // 4. Notify other systems of changes

    // Simulate database operations
    const syncOperations = [];

    if (updates.loginCode) {
      syncOperations.push({
        operation: 'update_login_code',
        techId,
        newCode: updates.loginCode,
        timestamp: new Date().toISOString()
      });
      
      // Update tech profile login code
      console.log(`Updating login code for tech ${techId}: ${updates.loginCode}`);
    }

    if (updates.name || updates.email || updates.specialties) {
      syncOperations.push({
        operation: 'update_profile',
        techId,
        profileData: {
          name: updates.name,
          email: updates.email,
          specialties: updates.specialties
        },
        timestamp: new Date().toISOString()
      });
      
      // Update tech profile basic info
      console.log(`Updating profile for tech ${techId}:`, updates);
    }

    if (updates.status) {
      syncOperations.push({
        operation: 'update_status',
        techId,
        status: updates.status,
        timestamp: new Date().toISOString()
      });
      
      // Update tech status (Active/Inactive/On Leave)
      console.log(`Updating status for tech ${techId}: ${updates.status}`);
    }

    // Simulate successful database updates
    const results = syncOperations.map(op => ({
      ...op,
      success: true
    }));

    // Update Tech Hub profile data if needed
    if (updates.loginCode || updates.name) {
      await updateTechHubProfile(techId, updates);
    }

    return NextResponse.json({
      success: true,
      syncedOperations: results,
      message: `Tech profile updated for ${updates.name || `Tech ID ${techId}`}`
    });

  } catch (error) {
    console.error('Tech profile sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync tech profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Simple in-memory store for demonstration - in production this would be a database
let techProfileStore: { [key: string]: any } = {
  '1': {
    id: 1,
    name: 'Alex Rodriguez',
    loginCode: 'A3X9M2',
    email: 'alex@popalock.com',
    lastSynced: new Date().toISOString(),
    syncStatus: 'active'
  }
};

async function updateTechHubProfile(techId: number, updates: any) {
  try {
    // In a real application, this would update the Tech Hub database
    // to ensure the leaderboard and profile data stays in sync
    
    console.log('Updating Tech Hub profile for tech:', techId);
    
    const hubUpdates = {
      id: techId,
      name: updates.name,
      loginCode: updates.loginCode,
      email: updates.email,
      lastUpdated: new Date().toISOString()
    };
    
    // Update the centralized store
    techProfileStore[techId.toString()] = {
      ...techProfileStore[techId.toString()],
      ...hubUpdates,
      lastSynced: new Date().toISOString(),
      syncStatus: 'active'
    };
    
    console.log('Tech Hub profile updated:', hubUpdates);
    console.log('Centralized store updated:', techProfileStore[techId.toString()]);
    
    return { success: true };
  } catch (error) {
    console.error('Tech Hub profile update error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const techId = searchParams.get('techId');
    
    if (!techId) {
      return NextResponse.json(
        { error: 'Technician ID is required' },
        { status: 400 }
      );
    }

    // In a real application, this would fetch the current sync status
    // and return the latest profile data from the franchisee system
    
    // Get profile from centralized store
    const profile = techProfileStore[techId] || {
      id: parseInt(techId),
      name: 'Tech User',
      loginCode: 'DEFAULT',
      email: 'tech@popalock.com',
      lastSynced: new Date().toISOString(),
      syncStatus: 'active'
    };

    return NextResponse.json({
      success: true,
      profile: profile,
      syncStatus: profile.syncStatus || 'active'
    });

  } catch (error) {
    console.error('Tech profile fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tech profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}