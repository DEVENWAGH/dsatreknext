'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { authAPI } from '@/api/api';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const EditProfileDialog = ({ userDetails, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { update } = useSession();

  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    email: userDetails?.email || '',
    username: userDetails?.username || '',
    bio: userDetails?.bio || '',
    githubUrl: userDetails?.githubUrl || '',
    linkedinUrl: userDetails?.linkedinUrl || '',
    portfolioUrl: userDetails?.portfolioUrl || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);

      if (response.success) {
        toast.success('Profile updated successfully');

        // Update session
        await update({
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          username: formData.username,
        });

        // Call parent callback
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }

        setOpen(false);

        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-600">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={e => {
                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                if (value.length <= 20) {
                  handleInputChange('username', value);
                }
              }}
              placeholder="Enter your username"
            />
            <p className="text-xs text-gray-500">
              Only letters, numbers, and underscores allowed (max 20 characters)
            </p>
            <p className="text-xs text-gray-500">
              Profile URL: /profile/{formData.username || 'username'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={e => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio Website</Label>
            <Input
              id="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={e => handleInputChange('portfolioUrl', e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl}
                onChange={e => handleInputChange('githubUrl', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={e => handleInputChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
