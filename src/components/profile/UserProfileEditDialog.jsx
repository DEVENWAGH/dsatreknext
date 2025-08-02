import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2 } from 'lucide-react';
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTrigger,
} from '@/components/ui/stacked-dialog';

const UserProfileEditDialog = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    gender: user?.gender || '',
    location: user?.location || '',
    birthday: user?.birthday || '',
    summary: user?.summary || '',
    website: user?.website || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    twitter: user?.twitter || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate?.(formData);
  };

  const sections = [
    {
      title: 'Basic Info',
      description: 'Update your personal information',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={formData.username}
              onChange={e => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]/g, '');
                handleInputChange('username', value);
              }}
              placeholder="Enter your username"
              pattern="^[a-z0-9_-]+$"
              minLength={3}
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used in your profile URL: /profile/
              {formData.username || 'username'}
              <br />
              Only lowercase letters, numbers, underscores, and hyphens allowed.
              3-30 characters.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gender</label>
            <Input
              value={formData.gender}
              onChange={e => handleInputChange('gender', e.target.value)}
              placeholder="Enter your gender"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder="Enter your location"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Birthday</label>
            <Input
              type="date"
              value={formData.birthday}
              onChange={e => handleInputChange('birthday', e.target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'About',
      description: 'Tell us about yourself',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={formData.summary}
              onChange={e => handleInputChange('summary', e.target.value)}
              placeholder="Tell us about yourself (interests, experience, etc.)"
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Social Links',
      description: 'Update your social media profiles',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Website</label>
            <Input
              value={formData.website}
              onChange={e => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">GitHub</label>
            <Input
              value={formData.github}
              onChange={e => handleInputChange('github', e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <Input
              value={formData.linkedin}
              onChange={e => handleInputChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">X (Twitter)</label>
            <Input
              value={formData.twitter}
              onChange={e => handleInputChange('twitter', e.target.value)}
              placeholder="https://x.com/username"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Account Settings',
      description: 'Manage your account',
      content: (
        <div className="space-y-4">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Account Management
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
              For account deletion and other critical account operations, please
              visit the main navigation menu.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DialogStack>
      <DialogStackTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </DialogStackTrigger>

      <DialogStackOverlay className="backdrop-blur-[2px]" />

      <DialogStackBody>
        {sections.map((section, index) => (
          <DialogStackContent key={index}>
            <DialogStackHeader className="mt-2 flex flex-row items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={user?.profilePicture || '/user.png'}
                  alt={user?.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold leading-none tracking-tight">
                  {section.title}
                </h1>
                <p className="text-black/50 dark:text-white/50">
                  {section.description}
                </p>
              </div>
            </DialogStackHeader>

            <div className="min-h-[200px] py-4">{section.content}</div>

            <DialogStackFooter>
              {index > 0 && (
                <DialogStackPrevious className="flex gap-2 items-center">
                  ← Previous
                </DialogStackPrevious>
              )}
              {index < sections.length - 1 ? (
                <DialogStackNext className="flex gap-2 items-center ml-auto">
                  Next →
                </DialogStackNext>
              ) : (
                <Button onClick={handleSave} className="ml-auto">
                  Save Changes
                </Button>
              )}
            </DialogStackFooter>
          </DialogStackContent>
        ))}
      </DialogStackBody>
    </DialogStack>
  );
};

export default UserProfileEditDialog;
