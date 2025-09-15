import { NextRequest, NextResponse } from 'next/server';

interface ReviewEvent {
  reportId: string;
  technicianId: string;
  event: 'review_started' | 'ai_review_generated' | 'review_completed' | 'google_redirect';
  timestamp: string;
  metadata?: {
    customerName?: string;
    serviceType?: string;
    rating?: number;
    reviewLength?: number;
    finalReview?: string;
    aiUsed?: boolean;
    reviewProcessTime?: number;
  };
}

// In a real app, this would be stored in a database
const reviewAnalytics: ReviewEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const data: ReviewEvent = await request.json();

    // Validate required fields
    if (!data.reportId || !data.technicianId || !data.event || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the event (in production, save to database)
    reviewAnalytics.push(data);

    console.log('📊 Review Analytics Event:', {
      technician: data.technicianId,
      event: data.event,
      timestamp: data.timestamp,
      metadata: data.metadata
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking review analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const timeframe = searchParams.get('timeframe') || '30'; // days

    // Calculate timeframe
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(timeframe));

    let filteredAnalytics = reviewAnalytics.filter(event =>
      new Date(event.timestamp) >= fromDate
    );

    if (technicianId) {
      filteredAnalytics = filteredAnalytics.filter(event =>
        event.technicianId === technicianId
      );
    }

    // Aggregate statistics by technician
    const technicianStats = new Map();

    filteredAnalytics.forEach(event => {
      const techId = event.technicianId;
      if (!technicianStats.has(techId)) {
        technicianStats.set(techId, {
          technicianId: techId,
          reviewsStarted: 0,
          reviewsCompleted: 0,
          aiUsageCount: 0,
          googleRedirects: 0,
          averageRating: 0,
          totalRatings: 0,
          ratingSum: 0,
          conversionRate: 0,
          averageReviewLength: 0,
          reviewLengths: []
        });
      }

      const stats = technicianStats.get(techId);

      switch (event.event) {
        case 'review_started':
          stats.reviewsStarted++;
          break;
        case 'ai_review_generated':
          stats.aiUsageCount++;
          if (event.metadata?.rating) {
            stats.ratingSum += event.metadata.rating;
            stats.totalRatings++;
          }
          break;
        case 'review_completed':
          stats.reviewsCompleted++;
          if (event.metadata?.reviewLength) {
            stats.reviewLengths.push(event.metadata.reviewLength);
          }
          break;
        case 'google_redirect':
          stats.googleRedirects++;
          break;
      }
    });

    // Calculate derived metrics
    const results = Array.from(technicianStats.values()).map(stats => {
      stats.conversionRate = stats.reviewsStarted > 0
        ? (stats.reviewsCompleted / stats.reviewsStarted * 100)
        : 0;

      stats.averageRating = stats.totalRatings > 0
        ? (stats.ratingSum / stats.totalRatings)
        : 0;

      stats.averageReviewLength = stats.reviewLengths.length > 0
        ? stats.reviewLengths.reduce((a, b) => a + b, 0) / stats.reviewLengths.length
        : 0;

      return {
        ...stats,
        conversionRate: Math.round(stats.conversionRate * 100) / 100,
        averageRating: Math.round(stats.averageRating * 100) / 100,
        averageReviewLength: Math.round(stats.averageReviewLength)
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
      timeframe: `${timeframe} days`,
      totalEvents: filteredAnalytics.length
    });
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}