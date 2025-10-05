import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Send, Bookmark, MoreHorizontal, ThumbsUp, Repeat2 } from 'lucide-react';

interface SocialMediaPreviewProps {
  platform: string;
  content: string;
  mediaUrl?: string;
  brandName?: string;
  brandAvatar?: string;
}

export function SocialMediaPreview({
  platform,
  content,
  mediaUrl,
  brandName = "Pop-A-Lock",
  brandAvatar = "/PAL-Canada-social.png"
}: SocialMediaPreviewProps) {

  // Instagram Preview
  if (platform === 'instagram') {
    return (
      <Card className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* Instagram Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={brandAvatar} alt={brandName} />
              <AvatarFallback>PAL</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{brandName}</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5" />
        </div>

        {/* Instagram Image */}
        {mediaUrl && (
          <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100">
            <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Instagram Actions */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <Send className="w-6 h-6" />
            </div>
            <Bookmark className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold">1,234 likes</p>

          {/* Instagram Caption */}
          <div className="text-sm">
            <span className="font-semibold">{brandName} </span>
            <span className="whitespace-pre-line">{content}</span>
          </div>

          <p className="text-xs text-gray-500 uppercase">2 hours ago</p>
        </div>
      </Card>
    );
  }

  // Facebook Preview
  if (platform === 'facebook') {
    return (
      <Card className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* Facebook Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={brandAvatar} alt={brandName} />
                <AvatarFallback>PAL</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{brandName}</p>
                <p className="text-xs text-gray-500">Just now · 🌐</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>

          {/* Facebook Content */}
          <div className="mt-3">
            <p className="text-sm whitespace-pre-line">{content}</p>
          </div>
        </div>

        {/* Facebook Image */}
        {mediaUrl && (
          <div className="w-full bg-gradient-to-br from-orange-100 to-red-100">
            <img src={mediaUrl} alt="Post" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Facebook Stats */}
        <div className="px-4 py-2 border-t border-b flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">👍</div>
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white">❤️</div>
            </div>
            <span className="ml-1">234</span>
          </div>
          <div className="flex gap-3">
            <span>12 comments</span>
            <span>8 shares</span>
          </div>
        </div>

        {/* Facebook Actions */}
        <div className="px-4 py-2 flex items-center justify-around">
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </Card>
    );
  }

  // Twitter/X Preview
  if (platform === 'twitter' || platform === 'x') {
    return (
      <Card className="max-w-xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <div className="p-4">
          {/* Twitter Header */}
          <div className="flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={brandAvatar} alt={brandName} />
              <AvatarFallback>PAL</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-bold text-sm">{brandName}</p>
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-gray-500 text-sm">@popalock · 2h</p>
              </div>

              {/* Twitter Content */}
              <div className="mt-2">
                <p className="text-sm whitespace-pre-line">{content}</p>
              </div>

              {/* Twitter Image */}
              {mediaUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                  <img src={mediaUrl} alt="Post" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* Twitter Actions */}
              <div className="mt-3 flex items-center justify-between max-w-md text-gray-500">
                <button className="flex items-center gap-2 hover:text-blue-500 group">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">12</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 group">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-xs">45</span>
                </button>
                <button className="flex items-center gap-2 hover:text-red-500 group">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">234</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 group">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // LinkedIn Preview
  if (platform === 'linkedin') {
    return (
      <Card className="max-w-xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* LinkedIn Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={brandAvatar} alt={brandName} />
              <AvatarFallback>PAL</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{brandName}</p>
              <p className="text-xs text-gray-500">Professional Locksmith Services</p>
              <p className="text-xs text-gray-500">2h · 🌐</p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>

          {/* LinkedIn Content */}
          <div className="mt-3">
            <p className="text-sm whitespace-pre-line">{content}</p>
          </div>
        </div>

        {/* LinkedIn Image */}
        {mediaUrl && (
          <div className="w-full bg-gradient-to-br from-orange-100 to-red-100">
            <img src={mediaUrl} alt="Post" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* LinkedIn Stats */}
        <div className="px-4 py-2 border-t border-b flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-1">156 reactions</span>
          </div>
          <div className="flex gap-3">
            <span>23 comments</span>
          </div>
        </div>

        {/* LinkedIn Actions */}
        <div className="px-4 py-2 flex items-center justify-around">
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <Repeat2 className="w-4 h-4" />
            <span className="text-sm font-medium">Repost</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </Card>
    );
  }

  // Google My Business Preview
  if (platform === 'google' || platform === 'google-business') {
    return (
      <Card className="max-w-xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* Google Post Image */}
        {mediaUrl && (
          <div className="w-full aspect-video bg-gray-100">
            <img src={mediaUrl} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Google Post Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={brandAvatar} alt={brandName} />
              <AvatarFallback>PAL</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{brandName}</p>
              <p className="text-xs text-gray-500">Just now</p>
            </div>
          </div>

          <p className="text-sm whitespace-pre-line leading-relaxed text-gray-800">
            {content}
          </p>

          {/* Google Actions */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-medium">Like</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Comment</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Default/General Preview
  return (
    <Card className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={brandAvatar} alt={brandName} />
            <AvatarFallback>PAL</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{brandName}</p>
            <p className="text-xs text-gray-500">Just now</p>
          </div>
        </div>
        <p className="text-sm whitespace-pre-line">{content}</p>
        {mediaUrl && (
          <img src={mediaUrl} alt="Post" className="w-full rounded-lg" />
        )}
      </div>
    </Card>
  );
}