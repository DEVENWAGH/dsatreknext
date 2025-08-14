import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import UserProfileEditDialog from './UserProfileEditDialog';

const ProfileSection = ({ user, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src={user?.profilePicture || '/user.png'}
            alt={user?.name}
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {user?.name || 'User Name'}
            </h2>
            <UserProfileEditDialog user={user} onUpdate={onUpdate} />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Gender</label>
            <p className="text-gray-900 dark:text-white">
              {user?.gender || 'Not specified'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Location
            </label>
            <p className="text-gray-900 dark:text-white">
              {user?.location || 'Not specified'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Birthday
            </label>
            <p className="text-gray-900 dark:text-white">
              {user?.birthday || 'Not specified'}
            </p>
          </div>
        </div>

        {user?.summary && (
          <div>
            <label className="text-sm font-medium text-gray-500">About</label>
            <p className="text-gray-900 dark:text-white mt-1">{user.summary}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-500">
            Social Links
          </label>
          <div className="flex flex-wrap gap-2">
            {user?.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Website
              </a>
            )}
            {user?.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                GitHub
              </a>
            )}
            {user?.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                LinkedIn
              </a>
            )}
            {user?.twitter && (
              <a
                href={user.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                X (Twitter)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
