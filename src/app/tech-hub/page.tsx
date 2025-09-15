'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TechUser {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  stats: {
    level: number;
    xp: number;
    totalJobs: number;
    approvedPics: number;
    streak: number;
    badges: string[];
  };
  title: string;
  location: string;
}

interface ChatMessage {
  id: string;
  userId: number;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'job_completion';
  isPrivate?: boolean;
  recipientId?: number;
  recipientName?: string;
  jobType?: string;
  location?: string;
}

const mockTechUsers: TechUser[] = [
  // Original team leads
  {
    id: 1,
    name: 'Alex Rodriguez',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 15,
      xp: 2890,
      totalJobs: 156,
      approvedPics: 142,
      streak: 12,
      badges: ['🏆 Master Tech', '🔥 Hot Streak', '📸 Photo Pro']
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
      totalJobs: 134,
      approvedPics: 125,
      streak: 8,
      badges: ['📸 Photo Pro', '🎯 Precision']
    },
    title: 'Residential Specialist',
    location: 'Austin, TX'
  },
  // Franchise technicians from real locations
  {
    id: 3,
    name: 'Marcus Thompson',
    avatar: 'https://i.pravatar.cc/150?u=marcus_thompson',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 11,
      xp: 1945,
      totalJobs: 89,
      approvedPics: 82,
      streak: 6,
      badges: ['🚗 Auto Expert', '🔧 Tool Master']
    },
    title: 'Automotive Locksmith',
    location: 'Birmingham, AL'
  },
  {
    id: 4,
    name: 'Jennifer Walsh',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_qf4dfd.jpg',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 8,
      xp: 1205,
      totalJobs: 67,
      approvedPics: 61,
      streak: 3,
      badges: ['🚨 Emergency Hero']
    },
    title: 'Emergency Specialist',
    location: 'Mobile, AL'
  },
  {
    id: 5,
    name: 'David Chen',
    avatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-04_s7fyto.jpg',
    isOnline: false,
    lastSeen: '2 hours ago',
    stats: {
      level: 14,
      xp: 2654,
      totalJobs: 189,
      approvedPics: 167,
      streak: 15,
      badges: ['🏢 Commercial King', '⭐ Veteran']
    },
    title: 'Commercial Specialist',
    location: 'Little Rock, AR'
  },
  {
    id: 6,
    name: 'Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?u=maria_garcia',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 9,
      xp: 1543,
      totalJobs: 78,
      approvedPics: 71,
      streak: 4,
      badges: ['🏠 Home Expert', '💪 Rising Star']
    },
    title: 'Residential Locksmith',
    location: 'Phoenix, AZ'
  },
  {
    id: 7,
    name: 'James Mitchell',
    avatar: 'https://i.pravatar.cc/150?u=james_mitchell',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 13,
      xp: 2234,
      totalJobs: 145,
      approvedPics: 138,
      streak: 9,
      badges: ['🏆 Top Performer', '🔥 Hot Streak']
    },
    title: 'Senior Locksmith',
    location: 'Sacramento, CA'
  },
  {
    id: 8,
    name: 'Ashley Brown',
    avatar: 'https://i.pravatar.cc/150?u=ashley_brown',
    isOnline: false,
    lastSeen: '45 minutes ago',
    stats: {
      level: 7,
      xp: 987,
      totalJobs: 54,
      approvedPics: 49,
      streak: 2,
      badges: ['🌟 Newcomer', '📚 Fast Learner']
    },
    title: 'Apprentice Locksmith',
    location: 'Denver, CO'
  },
  {
    id: 9,
    name: 'Robert Taylor',
    avatar: 'https://i.pravatar.cc/150?u=robert_taylor',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 10,
      xp: 1789,
      totalJobs: 92,
      approvedPics: 85,
      streak: 5,
      badges: ['🚨 Emergency Pro', '⚡ Speed Demon']
    },
    title: 'Emergency Specialist',
    location: 'Hartford, CT'
  },
  {
    id: 10,
    name: 'Lisa Anderson',
    avatar: 'https://i.pravatar.cc/150?u=lisa_anderson',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 12,
      xp: 2089,
      totalJobs: 118,
      approvedPics: 112,
      streak: 7,
      badges: ['🏢 Office Expert', '📸 Photo Pro']
    },
    title: 'Commercial Specialist',
    location: 'Washington, DC'
  },
  {
    id: 11,
    name: 'Christopher Lee',
    avatar: 'https://i.pravatar.cc/150?u=christopher_lee',
    isOnline: false,
    lastSeen: '30 minutes ago',
    stats: {
      level: 8,
      xp: 1234,
      totalJobs: 69,
      approvedPics: 63,
      streak: 3,
      badges: ['🚗 Auto Specialist', '🔧 Precision']
    },
    title: 'Automotive Locksmith',
    location: 'Jacksonville, FL'
  },
  {
    id: 12,
    name: 'Amanda Rodriguez',
    avatar: 'https://i.pravatar.cc/150?u=amanda_rodriguez',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 11,
      xp: 1876,
      totalJobs: 95,
      approvedPics: 89,
      streak: 6,
      badges: ['🏠 Residential Pro', '💪 Team Player']
    },
    title: 'Residential Specialist',
    location: 'Orlando, FL'
  },
  {
    id: 13,
    name: 'Kevin Johnson',
    avatar: 'https://i.pravatar.cc/150?u=kevin_johnson',
    isOnline: false,
    lastSeen: '90 minutes ago',
    stats: {
      level: 9,
      xp: 1456,
      totalJobs: 73,
      approvedPics: 68,
      streak: 4,
      badges: ['🚨 Night Shift', '🌙 Dedicated']
    },
    title: 'Emergency Locksmith',
    location: 'Tampa, FL'
  },
  {
    id: 14,
    name: 'Michelle Davis',
    avatar: 'https://i.pravatar.cc/150?u=michelle_davis',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 13,
      xp: 2345,
      totalJobs: 152,
      approvedPics: 145,
      streak: 10,
      badges: ['🏆 Excellence', '📸 Photo Master']
    },
    title: 'Senior Locksmith',
    location: 'Atlanta, GA'
  },
  {
    id: 15,
    name: 'Daniel Wilson',
    avatar: 'https://i.pravatar.cc/150?u=daniel_wilson',
    isOnline: false,
    lastSeen: '15 minutes ago',
    stats: {
      level: 6,
      xp: 789,
      totalJobs: 42,
      approvedPics: 38,
      streak: 2,
      badges: ['🌟 New Talent', '🚗 Auto Focus']
    },
    title: 'Junior Locksmith',
    location: 'Honolulu, HI'
  },
  {
    id: 16,
    name: 'Rachel Thompson',
    avatar: 'https://i.pravatar.cc/150?u=rachel_thompson',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 10,
      xp: 1698,
      totalJobs: 87,
      approvedPics: 81,
      streak: 5,
      badges: ['🏢 Corporate', '⭐ Reliable']
    },
    title: 'Commercial Locksmith',
    location: 'Indianapolis, IN'
  },
  {
    id: 17,
    name: 'Brandon Clark',
    avatar: 'https://i.pravatar.cc/150?u=brandon_clark',
    isOnline: false,
    lastSeen: '60 minutes ago',
    stats: {
      level: 8,
      xp: 1123,
      totalJobs: 58,
      approvedPics: 53,
      streak: 3,
      badges: ['🚨 Quick Response', '🔧 Problem Solver']
    },
    title: 'Emergency Specialist',
    location: 'Louisville, KY'
  },
  {
    id: 18,
    name: 'Stephanie Martinez',
    avatar: 'https://i.pravatar.cc/150?u=stephanie_martinez',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 11,
      xp: 1923,
      totalJobs: 102,
      approvedPics: 96,
      streak: 7,
      badges: ['🏠 Home Security', '💪 Customer Favorite']
    },
    title: 'Residential Specialist',
    location: 'Lafayette, LA'
  },
  {
    id: 19,
    name: 'Ryan Foster',
    avatar: 'https://i.pravatar.cc/150?u=ryan_foster',
    isOnline: false,
    lastSeen: '45 minutes ago',
    stats: {
      level: 7,
      xp: 945,
      totalJobs: 51,
      approvedPics: 46,
      streak: 2,
      badges: ['🚗 Car Expert', '📚 Learning Fast']
    },
    title: 'Automotive Trainee',
    location: 'Baton Rouge, LA'
  },
  {
    id: 20,
    name: 'Nicole Wright',
    avatar: 'https://i.pravatar.cc/150?u=nicole_wright',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 14,
      xp: 2567,
      totalJobs: 178,
      approvedPics: 171,
      streak: 12,
      badges: ['🏆 Master Tech', '🔥 Hot Streak', '📸 Photo Expert']
    },
    title: 'Senior Locksmith',
    location: 'Portland, ME'
  },
  {
    id: 21,
    name: 'Justin Adams',
    avatar: 'https://i.pravatar.cc/150?u=justin_adams',
    isOnline: false,
    lastSeen: '30 minutes ago',
    stats: {
      level: 9,
      xp: 1387,
      totalJobs: 71,
      approvedPics: 66,
      streak: 4,
      badges: ['🏢 Office Specialist', '⚡ Efficient']
    },
    title: 'Commercial Locksmith',
    location: 'Baltimore, MD'
  },
  {
    id: 22,
    name: 'Crystal Evans',
    avatar: 'https://i.pravatar.cc/150?u=crystal_evans',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 12,
      xp: 2134,
      totalJobs: 127,
      approvedPics: 119,
      streak: 8,
      badges: ['🏠 Residential Master', '🎯 Precision Pro']
    },
    title: 'Residential Specialist',
    location: 'Boston, MA'
  },
  {
    id: 23,
    name: 'Tyler Green',
    avatar: 'https://i.pravatar.cc/150?u=tyler_green',
    isOnline: false,
    lastSeen: '75 minutes ago',
    stats: {
      level: 8,
      xp: 1098,
      totalJobs: 59,
      approvedPics: 54,
      streak: 3,
      badges: ['🚗 Import Specialist', '🔧 Detail Oriented']
    },
    title: 'Automotive Locksmith',
    location: 'Detroit, MI'
  },
  {
    id: 24,
    name: 'Brittany Scott',
    avatar: 'https://i.pravatar.cc/150?u=brittany_scott',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 10,
      xp: 1732,
      totalJobs: 91,
      approvedPics: 85,
      streak: 5,
      badges: ['🚨 Emergency Expert', '🌙 Night Owl']
    },
    title: 'Emergency Specialist',
    location: 'Minneapolis, MN'
  },
  {
    id: 25,
    name: 'Anthony Baker',
    avatar: 'https://i.pravatar.cc/150?u=anthony_baker',
    isOnline: false,
    lastSeen: '20 minutes ago',
    stats: {
      level: 6,
      xp: 723,
      totalJobs: 39,
      approvedPics: 35,
      streak: 1,
      badges: ['🌟 Fresh Start', '💪 Motivated']
    },
    title: 'Apprentice Locksmith',
    location: 'Kansas City, MO'
  },
  {
    id: 26,
    name: 'Samantha Hill',
    avatar: 'https://i.pravatar.cc/150?u=samantha_hill',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 11,
      xp: 1865,
      totalJobs: 98,
      approvedPics: 92,
      streak: 6,
      badges: ['🏢 Business Focus', '📸 Photo Talent']
    },
    title: 'Commercial Specialist',
    location: 'Las Vegas, NV'
  },
  {
    id: 27,
    name: 'Jordan Cooper',
    avatar: 'https://i.pravatar.cc/150?u=jordan_cooper',
    isOnline: false,
    lastSeen: '90 minutes ago',
    stats: {
      level: 9,
      xp: 1432,
      totalJobs: 76,
      approvedPics: 71,
      streak: 4,
      badges: ['🏠 Home Solutions', '⭐ Customer Care']
    },
    title: 'Residential Locksmith',
    location: 'Manchester, NH'
  },
  {
    id: 28,
    name: 'Derek Price',
    avatar: 'https://i.pravatar.cc/150?u=derek_price',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 7,
      xp: 876,
      totalJobs: 48,
      approvedPics: 44,
      streak: 2,
      badges: ['🚗 Vehicle Pro', '🔧 Tech Savvy']
    },
    title: 'Automotive Specialist',
    location: 'Newark, NJ'
  },
  {
    id: 29,
    name: 'Vanessa Torres',
    avatar: 'https://i.pravatar.cc/150?u=vanessa_torres',
    isOnline: false,
    lastSeen: '180 minutes ago',
    stats: {
      level: 13,
      xp: 2298,
      totalJobs: 156,
      approvedPics: 148,
      streak: 9,
      badges: ['🚨 Crisis Manager', '🏆 Top Response']
    },
    title: 'Emergency Specialist',
    location: 'Albuquerque, NM'
  },
  {
    id: 30,
    name: 'Zachary Reed',
    avatar: 'https://i.pravatar.cc/150?u=zachary_reed',
    isOnline: true,
    lastSeen: 'now',
    stats: {
      level: 15,
      xp: 2789,
      totalJobs: 201,
      approvedPics: 193,
      streak: 14,
      badges: ['🏆 Master Tech', '🔥 Hot Streak', '⭐ Legend', '📸 Photo Master']
    },
    title: 'Senior Master Locksmith',
    location: 'New York, NY'
  }
];

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    userId: 2,
    userName: 'Sarah Wilson',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-01_ij9v7j.jpg',
    message: 'Duplicate key created for 2023 Honda Accord in North Dallas! 🗝️ Backup keys save the day!',
    timestamp: new Date(Date.now() - 15 * 60000),
    type: 'job_completion',
    jobType: 'automotive',
    location: 'North Dallas'
  },
  {
    id: '2',
    userId: 1,
    userName: 'Alex Rodriguez',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-02_upqrxi.jpg',
    message: 'Nice work Sarah! Those Hondas can be tricky with the transponder programming.',
    timestamp: new Date(Date.now() - 12 * 60000),
    type: 'message'
  },
  {
    id: '3',
    userId: 4,
    userName: 'Jennifer Walsh',
    userAvatar: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp1/avatar-40-03_qf4dfd.jpg',
    message: 'Emergency roadside assistance completed in Downtown Dallas! 🚨 Another driver saved! ⚡',
    timestamp: new Date(Date.now() - 8 * 60000),
    type: 'job_completion',
    jobType: 'roadside',
    location: 'Downtown Dallas'
  }
];

// Enhanced AI responses for demo - context-aware
const getAIResponse = async (message: string, isPrivate: boolean = false) => {
  const messageLower = message.toLowerCase();
  const messageHash = message.length + messageLower.charCodeAt(0) + messageLower.charCodeAt(Math.max(0, message.length - 1));
  
  // Context-aware responses based on message content
  if (messageLower.includes('lock') || messageLower.includes('key')) {
    const lockResponses = [
      "Nice work on that lock job! What type of lock were you working with?",
      "Lock work can be tricky! Did you have any challenges with the mechanism?",
      "Great job! Always satisfying when you get a stubborn lock working perfectly.",
      "Key work is an art form. Your experience really shows! 🗝️",
      "That's the kind of precision work that separates the pros from amateurs!"
    ];
    return lockResponses[messageHash % lockResponses.length];
  }
  
  if (messageLower.includes('car') || messageLower.includes('auto') || messageLower.includes('vehicle')) {
    const autoResponses = [
      "Automotive work keeps getting more complex! Those new key fobs are something else.",
      "Car lockouts are always stressful for customers. Great job getting them back on the road! 🚗",
      "Which year/make was it? Some of those newer models have tricky programming.",
      "Transponder keys can be a pain, but you handled it like a pro!",
      "Customer must have been relieved! Nothing worse than being locked out of your car."
    ];
    return autoResponses[messageHash % autoResponses.length];
  }
  
  if (messageLower.includes('emergency') || messageLower.includes('urgent') || messageLower.includes('help')) {
    const emergencyResponses = [
      "Emergency calls are what we're here for! Great response time! 🚨",
      "That's why we do this job - helping people in their time of need.",
      "Quick response on emergencies makes all the difference. Well done!",
      "Hope the customer wasn't too stressed out. You probably made their day!",
      "Emergency work can be tough, but you handled it perfectly!"
    ];
    return emergencyResponses[messageHash % emergencyResponses.length];
  }
  
  if (messageLower.includes('commercial') || messageLower.includes('office') || messageLower.includes('business')) {
    const commercialResponses = [
      "Commercial jobs are always interesting! Different challenges than residential.",
      "Business security is so important these days. Great work keeping them protected! 🏢",
      "Master key systems can be complex. Nice job managing all those access levels!",
      "Commercial clients really appreciate thorough, professional work.",
      "Office buildings have such specific security needs. You nailed it!"
    ];
    return commercialResponses[messageHash % commercialResponses.length];
  }
  
  if (messageLower.includes('home') || messageLower.includes('house') || messageLower.includes('residential')) {
    const residentialResponses = [
      "Home security is so personal to people. I bet they really appreciated your work! 🏠",
      "Residential jobs are the heart of what we do. Great work!",
      "There's nothing like helping a family feel safe in their home.",
      "Did they have kids? Families always seem extra grateful for good security.",
      "Home jobs can be the most rewarding. Making people feel secure in their space."
    ];
    return residentialResponses[messageHash % residentialResponses.length];
  }
  
  if (messageLower.includes('thank') || messageLower.includes('thanks') || messageLower.includes('appreciate')) {
    const thankYouResponses = [
      "Always happy to help a fellow tech! We're all in this together.",
      "That's what this team is all about - supporting each other! 👍",
      "No problem at all! Feel free to reach out anytime.",
      "We've all been there. Knowledge sharing is what makes us stronger!",
      "Anytime! This group is here for exactly this kind of support."
    ];
    return thankYouResponses[messageHash % thankYouResponses.length];
  }
  
  // Private message responses are more personal
  if (isPrivate) {
    const privateResponses = [
      "Hey! Good to chat with you privately. What's up?",
      "Always happy to help out a fellow tech. What can I assist with?",
      "Thanks for reaching out! How are things going in your area?",
      "Great to connect! Are you working on anything interesting lately?",
      "Hey there! Hope you're having a good day. What's on your mind?",
      "Good to hear from you! How's business been treating you?",
      "Always appreciate connecting with other professionals. What's going on?",
      "Nice to chat one-on-one! Anything specific you wanted to discuss?"
    ];
    return privateResponses[messageHash % privateResponses.length];
  }
  
  // General responses for everything else
  const generalResponses = [
    "That's awesome! Keep up the great work! 💪",
    "Great question! Always good to see people thinking through problems.",
    "Nice job team! Teamwork makes the dream work! 🎉",
    "I love seeing everyone help each other out. This is what makes our team strong! 👏",
    "Pro tip: Always double-check your work before leaving the job site.",
    "That's a common challenge in our field. Experience really helps with these situations.",
    "Excellent work! Your attention to detail really shows in your results.",
    "Thanks for sharing that insight! I'm sure others will find it helpful.",
    "Safety first everyone! Make sure you're following all protocols.",
    "Great discussion! This kind of knowledge sharing is invaluable.",
    "You're absolutely right about that! Experience teaches you these things.",
    "That's a great point. I hadn't thought about it that way before.",
    "Really appreciate you sharing your expertise with the group!",
    "That's the kind of professional approach that sets us apart! ⭐"
  ];
  
  return generalResponses[messageHash % generalResponses.length];
};

export default function TechHub() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState(mockTechUsers[0]);
  const [onlineUsers, setOnlineUsers] = useState(mockTechUsers);
  const [activeTab, setActiveTab] = useState('group');
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<TechUser | null>(null);
  const [privateMessages, setPrivateMessages] = useState<ChatMessage[]>([]);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user's franchise location
  const currentUserLocation = currentUser.location;
  
  // Organize users by franchise location
  const localTeamMembers = onlineUsers.filter(user => 
    user.location === currentUserLocation && user.id !== currentUser.id
  );
  const otherLocationMembers = onlineUsers.filter(user => 
    user.location !== currentUserLocation && user.id !== currentUser.id
  );
  
  // Group other location members by location
  const membersByLocation = otherLocationMembers.reduce((acc, user) => {
    if (!acc[user.location]) {
      acc[user.location] = [];
    }
    acc[user.location].push(user);
    return acc;
  }, {} as Record<string, TechUser[]>);

  // Calculate rankings
  const allUsersRanked = [...[currentUser], ...localTeamMembers, ...otherLocationMembers]
    .sort((a, b) => b.stats.totalJobs - a.stats.totalJobs);
  
  const localTeamRanked = [...[currentUser], ...localTeamMembers]
    .sort((a, b) => b.stats.totalJobs - a.stats.totalJobs);

  const getUserLocalRank = (userId: number) => {
    return localTeamRanked.findIndex(user => user.id === userId) + 1;
  };

  const getUserPALRank = (userId: number) => {
    return allUsersRanked.findIndex(user => user.id === userId) + 1;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, privateMessages]);

  // Add periodic background activity to make the chat feel alive
  useEffect(() => {
    let activityCounter = 0;
    
    const backgroundActivity = setInterval(() => {
      activityCounter++;
      
      // 30% chance of background job completion (using counter for determinism)
      if (activityCounter % 3 === 0) {
        const availableUsers = onlineUsers.filter(user => user.id !== currentUser.id && user.isOnline);
        if (availableUsers.length === 0) return;
        
        const userIndex = activityCounter % availableUsers.length;
        const selectedUser = availableUsers[userIndex];
        const jobTypes = ['commercial', 'residential', 'automotive', 'roadside'];
        const jobTypeIndex = activityCounter % jobTypes.length;
        const selectedJobType = jobTypes[jobTypeIndex];
        
        const jobTemplates = {
          commercial: [
            `Just finished a master key system upgrade for a small office in ${selectedUser.location.split(',')[0]}! 🏢`,
            `Completed access control installation downtown. Client loved the new keyless entry! 🔐`,
            `Business rekey job done! Another company secured with fresh keys. ✅`
          ],
          residential: [
            `Home lockout resolved in ${selectedUser.location.split(',')[0]}! Customer was so relieved! 🏠`,
            `Smart lock install complete! Family is loving their new tech upgrade! 📱`,
            `Deadbolt replacement finished. Another home secure for the night! 🔒`
          ],
          automotive: [
            `Car key programming done! 2023 Honda back on the road! 🚗`,
            `Vehicle lockout resolved in 15 minutes. Quick response saves the day! ⚡`,
            `Transponder key replacement complete. Customer was impressed with the speed! 🗝️`
          ],
          roadside: [
            `Emergency roadside call complete! Driver back on the road safely! 🚨`,
            `Late night lockout assistance finished. Always here when you need us! 🌙`,
            `Roadside emergency resolved. Another satisfied customer! 💪`
          ]
        };

        const templates = jobTemplates[selectedJobType as keyof typeof jobTemplates];
        const messageIndex = activityCounter % templates.length;
        const jobMessage = templates[messageIndex];

        const backgroundJobMessage: ChatMessage = {
          id: (Date.now() + activityCounter).toString(),
          userId: selectedUser.id,
          userName: selectedUser.name,
          userAvatar: selectedUser.avatar,
          message: jobMessage,
          timestamp: new Date(),
          type: 'job_completion',
          jobType: selectedJobType,
          location: selectedUser.location.split(',')[0]
        };

        setMessages(prev => [...prev, backgroundJobMessage]);
      }
      
      // 20% chance of general conversation (using counter for determinism)
      else if (activityCounter % 5 === 0) {
        const availableUsers = onlineUsers.filter(user => user.id !== currentUser.id && user.isOnline);
        if (availableUsers.length === 0) return;
        
        const userIndex = activityCounter % availableUsers.length;
        const selectedUser = availableUsers[userIndex];
        const conversationStarters = [
          "Anyone else dealing with these new smart lock models? They're getting complex! 🤔",
          "Busy day today! Three emergencies already and it's not even noon.",
          "Pro tip: Always carry spare batteries for electronic locks. Learned that the hard way!",
          "Weather's affecting response times today. Stay safe out there everyone!",
          "Just got certified on the new key programming system. Game changer! 🎉",
          "Customer today said we were lifesavers. Love this job! ❤️",
          "Anyone have experience with the new Ford key fobs? Different programming process.",
          "Shoutout to whoever recommended those new lock picks. Total game changer!",
          "Reminder: Check your equipment before heading out. Better safe than sorry!",
          "Great month for our team! Numbers are looking solid across the board."
        ];

        const messageIndex = activityCounter % conversationStarters.length;
        const backgroundMessage: ChatMessage = {
          id: (Date.now() + activityCounter).toString(),
          userId: selectedUser.id,
          userName: selectedUser.name,
          userAvatar: selectedUser.avatar,
          message: conversationStarters[messageIndex],
          timestamp: new Date(),
          type: 'message'
        };

        setMessages(prev => [...prev, backgroundMessage]);
      }
    }, 25000); // Fixed 25 second interval

    return () => clearInterval(backgroundActivity);
  }, [onlineUsers, currentUser.id]);

  // Simulate realistic tech responses from actual team members
  const simulateAIResponse = async (userMessage: string) => {
    setTimeout(async () => {
      const isPrivate = activeTab === 'private';
      const aiResponse = await getAIResponse(userMessage, isPrivate);
      
      let responder: TechUser;
      
      if (isPrivate && selectedPrivateUser) {
        // For private messages, always use the selected user as responder
        responder = selectedPrivateUser;
      } else {
        // For group messages, pick a random online user (excluding current user)
        const availableResponders = onlineUsers.filter(user => 
          user.id !== currentUser.id && user.isOnline
        );
        
        if (availableResponders.length === 0) return;
        
        // Use deterministic selection based on message length to avoid hydration issues
        const responderIndex = userMessage.length % availableResponders.length;
        responder = availableResponders[responderIndex];
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + (isPrivate ? 1 : 0)).toString(),
        userId: responder.id,
        userName: responder.name,
        userAvatar: responder.avatar,
        message: aiResponse,
        timestamp: new Date(),
        type: 'message'
      };

      if (activeTab === 'group') {
        setMessages(prev => [...prev, aiMessage]);
      } else if (selectedPrivateUser) {
        setPrivateMessages(prev => [...prev, aiMessage]);
      }
    }, 2500); // Fixed delay to avoid hydration issues
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: newMessage,
      timestamp: new Date(),
      type: 'message',
      isPrivate: activeTab === 'private',
      recipientId: selectedPrivateUser?.id,
      recipientName: selectedPrivateUser?.name
    };

    if (activeTab === 'group') {
      setMessages(prev => [...prev, message]);
    } else {
      setPrivateMessages(prev => [...prev, message]);
    }

    // Simulate AI response
    simulateAIResponse(newMessage);

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const onlineCount = onlineUsers.filter(user => user.isOnline).length;

  // Function to simulate job completion from tech profile auto-sharing
  const simulateJobCompletion = async () => {
    const jobTypes = ['commercial', 'residential', 'automotive', 'roadside'];
    const jobTypeIndex = Date.now() % jobTypes.length;
    const selectedJobType = jobTypes[jobTypeIndex];
    
    try {
      // Use the job sharing API to generate and post the job completion
      const response = await fetch('/api/tech-hub/job-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          techId: currentUser.id,
          techName: currentUser.name,
          jobType: selectedJobType,
          includeDetails: true, // Always include details for consistency
          includePhoto: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const jobPost = data.jobPost;

        const jobCompletionMessage: ChatMessage = {
          id: jobPost.id,
          userId: jobPost.userId,
          userName: jobPost.userName,
          userAvatar: currentUser.avatar,
          message: jobPost.message,
          timestamp: new Date(jobPost.timestamp),
          type: 'job_completion',
          jobType: jobPost.jobType,
          location: jobPost.location
        };

        setMessages(prev => [...prev, jobCompletionMessage]);
      }
    } catch (error) {
      console.error('Error sharing job completion:', error);
      // Fallback to local generation if API fails
      const locations = ['Downtown Dallas', 'North Dallas', 'East Dallas', 'West Dallas', 'Uptown Dallas', 'Plano', 'Richardson'];
      const locationIndex = Date.now() % locations.length;
      const selectedLocation = locations[locationIndex];
      
      const jobCompletionMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        message: `Job completed in ${selectedLocation} (API Error - using fallback)`,
        timestamp: new Date(),
        type: 'job_completion',
        jobType: selectedJobType,
        location: selectedLocation
      };

      setMessages(prev => [...prev, jobCompletionMessage]);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Team Workspace</h1>
                <p className="text-gray-600 dark:text-gray-400">Collaborate and stay connected with your team</p>
              </div>
            </div>

        {/* Top 5 Leaderboard */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  🏆 {showAllLeaderboard ? 'PAL Network Leaderboard' : `${currentUserLocation} Team Leaderboard`}
                </CardTitle>
                <CardDescription className="text-sm">
                  {showAllLeaderboard 
                    ? 'Top performers across all Pop-A-Lock locations'
                    : 'Top performers in your franchise this month'
                  }
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
              >
                {showAllLeaderboard ? 'Show My Team' : 'Show PAL Network'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(showAllLeaderboard 
                ? allUsersRanked // Show all PAL network users
                : localTeamRanked.slice(0, 5) // Show top 5 local team members
              )
                .map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    )}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</span>
                      <Badge variant="secondary" className="text-xs">L{user.stats.level}</Badge>
                      {user.location === currentUserLocation && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          Team
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.stats.totalJobs} jobs • {user.stats.streak} streak
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-primary font-medium">
                        {Math.round((user.stats.approvedPics / user.stats.totalJobs) * 100)}% approved
                      </div>
                      <div className="flex items-center gap-2">
                        {showAllLeaderboard ? (
                          // PAL Network view - show location for non-local users
                          user.location !== currentUserLocation && (
                            <div className="text-xs text-gray-400">
                              {user.location}
                            </div>
                          )
                        ) : (
                          // Local team view - show local rank
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            #{getUserLocalRank(user.id)} Team
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Team Chat - Full Width */}
        <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    💬 Team Workspace
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Collaborate, share updates, and stay connected • {onlineUsers.filter(u => u.isOnline).length} members online
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {onlineUsers.filter(u => u.isOnline).slice(0, 4).map(user => (
                      <div key={user.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {onlineUsers.filter(u => u.isOnline).length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{onlineUsers.filter(u => u.isOnline).length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="group">Group Chat</TabsTrigger>
                  <TabsTrigger value="private">Private Messages</TabsTrigger>
                </TabsList>
                
                <TabsContent value="group" className="mt-4">
                  <div className="space-y-4">
                    {/* Flowbite-style Team Chat */}
                    <div className="h-96 overflow-y-auto p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      {messages.map((message) => {
                        const user = onlineUsers.find(u => u.id === message.userId);
                        const isCurrentUser = message.userId === currentUser.id;
                        return (
                        <div key={message.id} className={`flex items-start gap-2.5 mb-4 ${isCurrentUser ? 'justify-end' : ''}`}>
                          {!isCurrentUser && (
                            <img className="w-8 h-8 rounded-full" src={message.userAvatar} alt={message.userName} />
                          )}
                          <div className={`flex flex-col w-full max-w-[320px] ${isCurrentUser ? 'items-end' : ''}`}>
                            <div className={`flex items-center space-x-2 rtl:space-x-reverse mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{message.userName}</span>
                              {user && (
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">L{user.stats.level} • {user.title}</span>
                              )}
                              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{formatTime(message.timestamp)}</span>
                            </div>
                            <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${
                              message.type === 'job_completion' 
                                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700'
                                : message.type === 'system'
                                ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700'
                                : isCurrentUser 
                                ? 'bg-blue-700 text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 border'
                            } ${
                              isCurrentUser 
                                ? 'rounded-s-xl rounded-ee-xl' 
                                : 'rounded-e-xl rounded-es-xl'
                            }`}>
                              {(message.type === 'job_completion' || message.type === 'system') && (
                                <div className="flex items-center gap-2 mb-2">
                                  {message.type === 'job_completion' && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                      🎯 Job Complete
                                    </span>
                                  )}
                                  {message.type === 'system' && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                      📢 System
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className={`text-sm font-normal ${
                                isCurrentUser ? 'text-white' : 'text-gray-900 dark:text-white'
                              }`}>
                                {message.message}
                              </p>
                              {message.type === 'job_completion' && message.jobType && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {message.jobType === 'commercial' && '🏢 Commercial'}
                                    {message.jobType === 'residential' && '🏠 Residential'}  
                                    {message.jobType === 'automotive' && '🚗 Automotive'}
                                    {message.jobType === 'roadside' && '🚨 Roadside'}
                                  </span>
                                  {message.location && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      📍 {message.location}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {isCurrentUser && (
                            <img className="w-8 h-8 rounded-full" src={message.userAvatar} alt={message.userName} />
                          )}
                        </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Flowbite-style Message Input */}
                    <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <button
                        type="button"
                        onClick={simulateJobCompletion}
                        className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                      >
                        <span className="sr-only">Share job completion</span>
                        🎯
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message the team..."
                        className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                          <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                        </svg>
                        <span className="sr-only">Send message</span>
                      </button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="private" className="mt-4">
                  <div className="space-y-4">
                    {!selectedPrivateUser ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Select someone to start a private conversation</p>
                        <div className="space-y-4">
                          {/* Local Team Members */}
                          {localTeamMembers.filter(u => u.isOnline).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">My Team - {currentUserLocation}</h4>
                              <div className="space-y-2">
                                {localTeamMembers.filter(u => u.isOnline).map(user => (
                                  <button
                                    key={user.id}
                                    onClick={() => setSelectedPrivateUser(user)}
                                    className="flex items-center gap-3 w-full p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
                                  >
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left flex-1">
                                      <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.title} • Level {user.stats.level}</div>
                                    </div>
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                      Team
                                    </Badge>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Other Locations */}
                          {otherLocationMembers.filter(u => u.isOnline).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Other Locations</h4>
                              <div className="space-y-2">
                                {otherLocationMembers
                                  .filter(u => u.isOnline)
                                  .sort((a, b) => b.stats.level - a.stats.level)
                                  .map(user => (
                                    <button
                                      key={user.id}
                                      onClick={() => setSelectedPrivateUser(user)}
                                      className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                      <div className="w-6 h-6 rounded-full overflow-hidden">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="text-left flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {user.name} <span className="text-gray-500 dark:text-gray-400 font-normal">• {user.location}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.title} • Level {user.stats.level}</div>
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b">
                          <button
                            onClick={() => setSelectedPrivateUser(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ← Back
                          </button>
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img src={selectedPrivateUser.avatar} alt={selectedPrivateUser.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{selectedPrivateUser.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Private conversation</div>
                          </div>
                        </div>

                        {/* Private Messages */}
                        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-white dark:bg-gray-800 border rounded-lg">
                          {privateMessages.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No messages yet. Start the conversation!</p>
                          ) : (
                            privateMessages.map((message) => (
                              <div key={message.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {message.userId === 999 ? (
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                                      🤖
                                    </div>
                                  ) : (
                                    <img
                                      src={message.userAvatar}
                                      alt={message.userName}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {message.userName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatTime(message.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {message.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Private Message Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${selectedPrivateUser.name}...`}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                          />
                          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                            Send
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}