import { NextRequest, NextResponse } from 'next/server';

// Job completion templates
const jobTemplates = {
  commercial: [
    'Just completed a master key installation at {location}! 🏢 All access points secured and tested.',
    'Finished upgrading the access control system at {location}. Security level: Enhanced! 🔒',
    'Commercial rekey completed at {location}. Building security is now up to date! ✅',
    'Office lockout resolved at {location}! 🏢 Business operations back to normal.',
    'New high-security locks installed at {location}. Premium protection activated! 💪'
  ],
  residential: [
    'Home rekey completed for a customer in {location}! 🏠 Fresh keys, fresh peace of mind.',
    'Smart lock installation finished at {location}! Welcome to the future of home security! 🚪🔐',
    'Lock repair completed in {location}. Another satisfied homeowner! 😊',
    'Deadbolt installation finished at {location}. Home sweet secure home! 🔐',
    'Emergency lockout resolved in {location}. Family reunited with their home! ❤️'
  ],
  automotive: [
    'Car lockout resolved in {location}! 🚗 Customer back on the road in under 30 minutes.',
    'Key fob programming completed for {vehicle} in {location}. Technology at work! 🔑',
    'Ignition repair finished in {location}. Smooth start every time! 🚗✨',
    'Duplicate key created for {vehicle} in {location}. Backup keys save the day! 🗝️',
    'Transponder key programmed for {vehicle}. High-tech security restored! 💻'
  ],
  roadside: [
    'Emergency roadside assistance completed in {location}! 🚨 Another driver saved!',
    'Lockout service provided in {location}. Fast response, happy customer! ⚡',
    'Roadside emergency resolved in {location}. Always here when you need us! 💪',
    'Stranded no more! Lockout assistance completed in {location}. 🚗✨',
    'Middle-of-the-night emergency in {location}. We\'re always on call! 🌙'
  ]
};

const locations = [
  'Downtown Dallas', 'North Dallas', 'East Dallas', 'West Dallas', 'Uptown Dallas',
  'Plano', 'Richardson', 'Garland', 'Irving', 'Arlington', 'Fort Worth',
  'Addison', 'Carrollton', 'Frisco', 'McKinney', 'Denton'
];

const vehicles = [
  '2023 Honda Accord', '2022 Toyota Camry', '2021 Ford F-150', '2023 Chevy Silverado',
  '2022 BMW 3 Series', '2021 Mercedes C-Class', '2023 Nissan Altima', '2022 Hyundai Elantra',
  '2021 Jeep Grand Cherokee', '2023 Subaru Outback'
];

export async function POST(request: NextRequest) {
  try {
    const { techId, techName, jobType, customLocation, customVehicle, includeDetails, includePhoto } = await request.json();
    
    if (!techId || !techName || !jobType) {
      return NextResponse.json(
        { error: 'Missing required fields: techId, techName, jobType' },
        { status: 400 }
      );
    }

    // Generate job post
    const templates = jobTemplates[jobType as keyof typeof jobTemplates] || jobTemplates.commercial;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const location = customLocation || locations[Math.floor(Math.random() * locations.length)];
    const vehicle = customVehicle || vehicles[Math.floor(Math.random() * vehicles.length)];
    
    let jobMessage = template
      .replace('{location}', location)
      .replace('{vehicle}', vehicle);

    // Add job details if requested
    if (includeDetails) {
      const details = [
        'Quick response time ⚡',
        'No damage to property ✅',
        'Customer education provided 📚',
        'Premium tools used 🔧',
        'Follow-up scheduled 📅'
      ];
      const randomDetail = details[Math.floor(Math.random() * details.length)];
      jobMessage += ` ${randomDetail}`;
    }

    // Simulate the job completion post
    const jobPost = {
      id: Date.now().toString(),
      userId: techId,
      userName: techName,
      userAvatar: '', // Would be populated from tech profile
      message: jobMessage,
      timestamp: new Date(),
      type: 'job_completion',
      jobType,
      location,
      includePhoto
    };

    console.log('Job completion shared:', { techName, jobType, location });

    return NextResponse.json({
      success: true,
      jobPost,
      message: 'Job completion shared to group chat'
    });

  } catch (error) {
    console.error('Job Share API Error:', error);
    return NextResponse.json(
      { error: 'Failed to share job completion' },
      { status: 500 }
    );
  }
}

// Get job sharing settings for a tech
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const techId = searchParams.get('tech_id');
    
    if (!techId) {
      return NextResponse.json(
        { error: 'Tech ID is required' },
        { status: 400 }
      );
    }

    // Mock settings - in production, fetch from database
    const mockSettings = {
      techId: parseInt(techId),
      autoShareJobs: true,
      shareJobTypes: {
        commercial: true,
        residential: true,
        automotive: false,
        roadside: true
      },
      shareJobDetails: true,
      sharePhotos: false
    };

    return NextResponse.json({
      success: true,
      settings: mockSettings
    });

  } catch (error) {
    console.error('Get Job Share Settings Error:', error);
    return NextResponse.json(
      { error: 'Failed to get job sharing settings' },
      { status: 500 }
    );
  }
}