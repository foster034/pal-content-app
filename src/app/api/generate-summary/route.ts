import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const body = await request.json();
    
    const {
      category,
      service,
      location,
      description,
      jobComplexity,
      customerSatisfaction,
      customerQuote,
      vehicle,
      techName,
      photoCount
    } = body;

    // Create a prompt for OpenAI to enhance the tech's description
    let prompt = '';
    
    if (description && description.trim()) {
      // Tech provided description/comments - enhance it into a professional service report
      prompt = `Transform the following technician's notes into a professional service report for a Pop-A-Lock locksmith service:

TECHNICIAN'S NOTES:
"${description}"

JOB DETAILS:
Service Category: ${category}
Service Type: ${service}
${location ? `Location: ${location}` : ''}
${jobComplexity ? `Job Complexity: ${jobComplexity}` : ''}
${vehicle ? `Vehicle: ${vehicle}` : ''}
${customerSatisfaction ? `Customer Rating: ${customerSatisfaction}/5 stars` : ''}
${customerQuote ? `Customer Feedback: "${customerQuote}"` : ''}
${photoCount > 0 ? `Documentation: ${photoCount} professional photos taken` : ''}
${techName ? `Technician: ${techName}` : ''}

INSTRUCTIONS:
- Transform the tech's raw notes into a clear, professional service report
- Maintain all technical details and specific information
- Use professional, technical language appropriate for service documentation
- Include the work performed, challenges encountered, and resolution
- Keep it factual and informative
- Format as a proper service report summary
- Focus on what was accomplished and how

Write a professional service report:`;
    } else {
      // No description provided - create a basic service report from job details
      prompt = `Create a professional service report for a Pop-A-Lock locksmith service job with the following details:

Service Category: ${category}
Service Type: ${service}
${location ? `Location: ${location}` : ''}
${jobComplexity ? `Job Complexity: ${jobComplexity}` : ''}
${vehicle ? `Vehicle: ${vehicle}` : ''}
${customerSatisfaction ? `Customer Rating: ${customerSatisfaction}/5 stars` : ''}
${customerQuote ? `Customer Feedback: "${customerQuote}"` : ''}
${photoCount > 0 ? `Documentation: ${photoCount} professional photos taken` : ''}
${techName ? `Technician: ${techName}` : ''}

Requirements:
- Write in a professional, technical tone appropriate for service documentation
- Focus on the technical service provided and completion details
- Include specific information about the work performed
- Keep it factual and informative
- Format as a proper service report summary
- Focus on what service was completed and key details

Write a professional service report:`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional marketing copywriter specializing in service industry content. Create compelling, authentic marketing descriptions that highlight expertise, efficiency, and customer satisfaction."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('No content generated');
    }

    return NextResponse.json({ summary: generatedText });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}