import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobData, photos } = await request.json();

    // Extract relevant information for AI report generation
    const { service, media, technician, client } = jobData;

    const prompt = `Generate a professional job report for a locksmith service based on the following details:

Service Category: ${service.category}
Service Type: ${service.type}
Location: ${service.location}
Date: ${service.date}
Duration: ${service.duration} minutes
Technician: ${technician.name || 'N/A'}
Service Description: ${service.description}
Customer Satisfaction: ${service.satisfaction}/5

Photos: ${photos.length} photos were taken during the service
- Before Photos: ${media.beforePhotos?.length || 0}
- Process Photos: ${media.processPhotos?.length || 0}
- After Photos: ${media.afterPhotos?.length || 0}

Please generate a comprehensive job report that includes:
1. Executive Summary
2. Work Performed
3. Materials Used
4. Challenges Encountered (if any)
5. Quality Assessment
6. Customer Satisfaction
7. Recommendations

The report should be professional, detailed, and suitable for both technical records and customer communication.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional locksmith service report generator. Create detailed, accurate, and professional job reports based on the provided service information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('Failed to generate AI report');
    }

    const aiResponse = await openaiResponse.json();
    const generatedReport = aiResponse.choices[0].message.content;

    return NextResponse.json({
      success: true,
      report: generatedReport,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating job report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate job report',
        report: 'AI report generation is currently unavailable. Please contact support for assistance.'
      },
      { status: 500 }
    );
  }
}