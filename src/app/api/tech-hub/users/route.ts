import { NextRequest, NextResponse } from 'next/server';

// Mock data for tech users
const techUsers = [
  {
    id: 1,
    name: 'Alex Rodriguez',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 15,
      xp: 2890,
      xpToNext: 1110,
      totalJobs: 156,
      approvedPics: 142,
      streak: 12,
      badges: ['🏆 Master Tech', '🔥 Hot Streak', '📸 Photo Pro', '⚡ Speed Demon']
    },
    title: 'Senior Locksmith',
    location: 'Dallas, TX'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 12,
      xp: 2156,
      xpToNext: 844,
      totalJobs: 134,
      approvedPics: 125,
      streak: 8,
      badges: ['📸 Photo Pro', '🎯 Precision', '🌟 Rising Star']
    },
    title: 'Residential Specialist',
    location: 'Austin, TX'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-05_cmz0mg.jpg',
    isOnline: Math.random() > 0.3,
    lastSeen: Math.random() > 0.5 ? 'now' : `${Math.floor(Math.random() * 60)} minutes ago`,
    stats: {
      level: 10,
      xp: 1834,
      xpToNext: 1166,
      totalJobs: 98,
      approvedPics: 89,
      streak: 5,
      badges: ['🚗 Auto Expert', '🔧 Tool Master']
    },
    title: 'Automotive Locksmith',
    location: 'Houston, TX'
  },
  {
    id: 4,
    name: 'Jennifer Walsh',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_qf4dfd.jpg',
    isOnline: Math.random() > 0.4,
    lastSeen: Math.random() > 0.5 ? 'now' : `${Math.floor(Math.random() * 120)} minutes ago`,
    stats: {
      level: 8,
      xp: 1205,
      xpToNext: 795,
      totalJobs: 67,
      approvedPics: 61,
      streak: 3,
      badges: ['🚨 Emergency Hero', '💪 Rookie of Year']
    },
    title: 'Emergency Specialist',
    location: 'Fort Worth, TX'
  },
  {
    id: 5,
    name: 'David Chen',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-04_s7fyto.jpg',
    isOnline: Math.random() > 0.5,
    lastSeen: Math.random() > 0.4 ? 'now' : `${Math.floor(Math.random() * 180)} minutes ago`,
    stats: {
      level: 14,
      xp: 2654,
      xpToNext: 1346,
      totalJobs: 189,
      approvedPics: 167,
      streak: 15,
      badges: ['🏢 Commercial King', '🔥 Hot Streak', '🎯 Precision', '⭐ Veteran']
    },
    title: 'Commercial Specialist',
    location: 'Plano, TX'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Simulate dynamic online status
    const updatedUsers = techUsers.map(user => ({
      ...user,
      isOnline: user.id <= 2 ? true : Math.random() > 0.3, // Keep top 2 users always online
      lastSeen: user.isOnline || (user.id <= 2) ? 'now' : 
        `${Math.floor(Math.random() * 120)} minutes ago`
    }));

    console.log('Tech Hub: Sending user data, online count:', 
      updatedUsers.filter(u => u.isOnline).length);

    return NextResponse.json({
      success: true,
      users: updatedUsers,
      onlineCount: updatedUsers.filter(u => u.isOnline).length,
      totalUsers: updatedUsers.length
    });

  } catch (error) {
    console.error('Tech Hub Users API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get tech hub users' },
      { status: 500 }
    );
  }
}