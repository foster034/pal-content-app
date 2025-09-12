import { NextRequest, NextResponse } from 'next/server';

// Mock chat messages storage (in production, use a real database)
let chatMessages: Array<{
  id: string;
  userId: number;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'achievement' | 'system';
}> = [
  {
    id: '1',
    userId: 2,
    userName: 'Sarah Wilson',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
    message: 'Just finished a tricky smart lock install! Anyone else working with the new August Pro models?',
    timestamp: new Date(Date.now() - 15 * 60000),
    type: 'message'
  },
  {
    id: '2',
    userId: 1,
    userName: 'Alex Rodriguez',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    message: 'Nice work Sarah! Those August Pros can be finicky. Make sure to calibrate the auto-lock timing.',
    timestamp: new Date(Date.now() - 12 * 60000),
    type: 'message'
  },
  {
    id: '3',
    userId: 0,
    userName: 'System',
    userAvatar: '',
    message: '🏆 Alex Rodriguez just earned "Master Tech" achievement for completing 150+ jobs!',
    timestamp: new Date(Date.now() - 8 * 60000),
    type: 'achievement'
  },
  {
    id: '4',
    userId: 4,
    userName: 'Jennifer Walsh',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_qf4dfd.jpg',
    message: 'Congrats Alex! 🎉 Question: anyone have tips for emergency lockouts in this heat?',
    timestamp: new Date(Date.now() - 5 * 60000),
    type: 'message'
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Return recent messages
    const recentMessages = chatMessages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);

    console.log('Tech Hub: Sending chat messages, count:', recentMessages.length);

    return NextResponse.json({
      success: true,
      messages: recentMessages,
      total: chatMessages.length
    });

  } catch (error) {
    console.error('Tech Hub Chat GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userAvatar, message } = await request.json();
    
    if (!userId || !userName || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, message' },
        { status: 400 }
      );
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      userId: parseInt(userId),
      userName,
      userAvatar: userAvatar || '',
      message: message.trim(),
      timestamp: new Date(),
      type: 'message' as const
    };

    // Add to messages array
    chatMessages.push(newMessage);
    
    // Keep only last 100 messages to prevent memory issues
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }

    console.log('Tech Hub: New message from', userName, ':', message.substring(0, 50));

    // Simulate achievement notifications
    const messageCount = chatMessages.filter(m => m.userId === parseInt(userId)).length;
    if (messageCount === 10) {
      setTimeout(() => {
        const achievementMessage = {
          id: (Date.now() + 1).toString(),
          userId: 0,
          userName: 'System',
          userAvatar: '',
          message: `🗣️ ${userName} just earned "Chatterbox" achievement for 10 chat messages!`,
          timestamp: new Date(),
          type: 'achievement' as const
        };
        chatMessages.push(achievementMessage);
      }, 1000);
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Tech Hub Chat POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}