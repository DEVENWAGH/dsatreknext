'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarDays,
  Upload,
  Twitter,
  Facebook,
  Linkedin,
  Link,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ProfileStatistics from './ProfileStatistics';
import { userAPI } from '@/api/api';
import { toast } from 'sonner';
import CustomAvatarFallback from '@/components/ui/avatar-fallback';
import EditProfileDialog from './EditProfileDialog';
import ShareButton from '@/components/ui/share-button';

const ProfileLeftSection = ({
  userDetails,
  isOwnProfile,
  userId,
  onAvatarUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  if (!userDetails) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-md">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="w-24 h-24 bg-muted/30 rounded-full mx-auto"></div>
              <div className="h-6 bg-muted/30 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted/20 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinedDate = userDetails?.createdAt
    ? format(new Date(userDetails.createdAt), 'dd/MM/yyyy')
    : 'N/A';

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await userAPI.uploadAvatar(file);
      if (response.success) {
        if (onAvatarUpdate) {
          onAvatarUpdate(response.data.avatar);
        }
        // Force session refresh
        window.location.reload();
        toast.success('Profile image updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('Failed to update profile image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-amber-500/10 via-background/95 to-amber-600/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-amber-500/20 overflow-hidden">
        <div className="relative">
          {/* Golden background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-600/10" />

          {/* Content */}
          <div className="relative p-6">
            <div className="flex items-center space-x-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {userDetails?.profilePicture || userDetails?.image ? (
                  <Avatar className="w-20 h-20 border-4 border-amber-500/30 shadow-2xl shadow-amber-500/20">
                    <AvatarImage
                      src={userDetails?.profilePicture || userDetails?.image}
                      alt={userDetails?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white text-lg">
                      {userDetails?.name
                        ? userDetails.name[0].toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <CustomAvatarFallback
                    name={
                      userDetails?.firstName && userDetails?.lastName
                        ? `${userDetails.firstName} ${userDetails.lastName}`
                        : userDetails?.name || 'User'
                    }
                    size={80}
                    className="border-4 border-amber-500/30 shadow-2xl shadow-amber-500/20"
                  />
                )}

                {isOwnProfile && (
                  <label
                    htmlFor="avatarUpload"
                    className="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm opacity-0 hover:opacity-100 cursor-pointer rounded-full transition-all duration-200 group border-2 border-amber-500/30"
                  >
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-amber-400 transform group-hover:scale-110 transition-transform" />
                    )}
                    <input
                      id="avatarUpload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                    {userDetails?.firstName && userDetails?.lastName
                      ? `${userDetails.firstName} ${userDetails.lastName}`
                      : userDetails?.name || 'User'}
                  </h2>
                  <div className="text-amber-600/80 text-sm flex items-center gap-2 mt-1">
                    <CalendarDays className="w-4 h-4 text-amber-500" />
                    <span>Joined on {joinedDate}</span>
                  </div>

                  <div className="mt-4">
                    <ShareButton
                      links={[
                        {
                          icon: Twitter,
                          onClick: () =>
                            window.open(
                              `https://twitter.com/intent/tweet?text=Check out ${userDetails?.firstName && userDetails?.lastName ? `${userDetails.firstName} ${userDetails.lastName}` : userDetails?.name || 'this user'}'s profile on DSATrek!&url=${window.location.href}`
                            ),
                          label: 'Share on Twitter',
                        },
                        {
                          icon: Facebook,
                          onClick: () =>
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=Check out ${userDetails?.firstName && userDetails?.lastName ? `${userDetails.firstName} ${userDetails.lastName}` : userDetails?.name || 'this user'}'s profile on DSATrek!`
                            ),
                          label: 'Share on Facebook',
                        },
                        {
                          icon: Linkedin,
                          onClick: () =>
                            window.open(
                              `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}&title=DSATrek Profile&summary=Check out ${userDetails?.firstName && userDetails?.lastName ? `${userDetails.firstName} ${userDetails.lastName}` : userDetails?.name || 'this user'}'s profile on DSATrek!`
                            ),
                          label: 'Share on LinkedIn',
                        },
                        {
                          icon: Link,
                          onClick: () => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Profile link copied to clipboard!');
                          },
                          label: 'Copy link',
                        },
                      ]}
                      className="text-sm font-medium"
                    >
                      <Link size={15} />
                      Share
                    </ShareButton>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ProfileStatistics userId={userId} />
      </motion.div>
    </motion.div>
  );
};

export default ProfileLeftSection;
