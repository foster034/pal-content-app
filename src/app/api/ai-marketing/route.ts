import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('AI Marketing API called');
  
  try {
    const { message, mediaContext, conversationHistory } = await request.json();
    console.log('Received data:', { message, mediaContext, historyLength: conversationHistory?.length });

    const systemPrompt = `You are an AI Marketing Specialist who is both a social media expert AND a professional locksmith with deep industry knowledge. You help create engaging social media content for Pop-A-Lock franchise locations.

Your expertise includes:
- All major social media platforms (Instagram, Facebook, LinkedIn, TikTok, Twitter, YouTube, Pinterest, Google My Business)
- Professional locksmith services (Commercial, Residential, Automotive, Roadside assistance)
- Social media best practices, hashtags, engagement strategies
- Visual content recommendations and captions
- Platform-specific content optimization

Job Context:
- Service Type: ${mediaContext.jobType}
- Job Description: ${mediaContext.jobDescription}
- Location: ${mediaContext.jobLocation}
- Technician: ${mediaContext.techName}
- Franchisee: ${mediaContext.franchiseeName}
- Notes: ${mediaContext.notes || 'None provided'}

IMPORTANT: Generate ONLY the final social media post content. Do NOT include:
- Tips and tricks sections
- Explanatory text about the post
- Instructions or suggestions about posting
- Additional commentary or advice
- Multiple post variations

Always provide:
1. Clean, ready-to-post content only
2. Relevant hashtags integrated naturally
3. Platform-appropriate formatting
4. Professional locksmith terminology when appropriate
5. Call-to-action integrated naturally in the post

Keep the response as the final post content that can be directly copied and pasted to social media. Use emojis appropriately for social media content.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with messages:', messages.length);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log('OpenAI response received');
    
    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('Sending response back to client');
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Marketing API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response', details: error.message },
      { status: 500 }
    );
  }
}