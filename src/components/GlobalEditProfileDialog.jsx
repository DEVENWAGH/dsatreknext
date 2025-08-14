import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { authAPI } from '@/api/api';
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
} from '@/components/ui/stacked-dialog';

const GlobalEditProfileDialog = () => {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    location: '',
    birthday: '',
    summary: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    experience: [
      { company: '', position: '', startDate: '', endDate: '', current: false },
    ],
    education: [{ institution: '', degree: '', startDate: '', endDate: '' }],
    skills: [],
  });
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const handleOpenEdit = () => {
      setIsOpen(true);
    };

    window.addEventListener('openEditProfile', handleOpenEdit);
    return () => window.removeEventListener('openEditProfile', handleOpenEdit);
  }, []);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchUserData();
    }
  }, [isOpen, session?.user?.id]);

  const fetchUserData = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      const userData = await response.json();
      if (userData.success) {
        const user = userData.data;
        setUserAvatar(user.profilePicture || session?.user?.image);
        setFormData({
          username:
            user.username ||
            session?.user?.username ||
            session?.user?.name?.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
            session?.user?.email?.split('@')[0] ||
            '',
          gender: user.gender || '',
          location: user.location || '',
          birthday: user.birthday || '',
          summary: user.summary || '',
          website: user.websiteUrl || user.website || '',
          github: user.github || '',
          linkedin: user.linkedin || '',
          twitter: user.twitterUrl || user.twitter || '',
          experience: user.experience
            ? typeof user.experience === 'string'
              ? JSON.parse(user.experience)
              : user.experience
            : [
                {
                  company: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  current: false,
                },
              ],
          education: user.education
            ? typeof user.education === 'string'
              ? JSON.parse(user.education)
              : user.education
            : [{ institution: '', degree: '', startDate: '', endDate: '' }],
          skills: user.skills
            ? typeof user.skills === 'string'
              ? JSON.parse(user.skills)
              : user.skills
            : [],
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');

        // Update session if username changed
        if (formData.username !== session?.user?.username) {
          await update({
            ...session.user,
            username: formData.username,
          });
        }

        setIsOpen(false);

        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
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
                  .replace(/[^a-z0-9_]/g, '')
                  .slice(0, 20);
                handleInputChange('username', value);
              }}
              placeholder="Enter your username"
              pattern="^[a-z0-9_]+$"
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only letters, numbers, and underscores (3-20 characters)
            </p>
            <p className="text-xs text-muted-foreground">
              Profile URL: /profile/{formData.username || 'username'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Gender</label>
            <Select
              value={formData.gender}
              onValueChange={value => handleInputChange('gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="not-disclosed">
                  Prefer not to disclose
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder="India, Maharashtra, Panvel"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Birthday</label>
            <Input
              type="date"
              value={formData.birthday}
              onChange={e => handleInputChange('birthday', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1950-01-01"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'About & Links',
      description: 'Tell us about yourself and add social links',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={formData.summary}
              onChange={e => handleInputChange('summary', e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const nextButton = document.querySelector(
                    '[data-dialog-stack-next]'
                  );
                  if (nextButton) nextButton.click();
                }
              }}
              placeholder="Tell us about yourself (interests, experience, etc.)"
              rows={3}
            />
          </div>
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
      title: 'Experience',
      description: 'Add your work experience or education',
      content: (
        <div className="space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-4">
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('experience', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Company/Institution"
                    value={exp.company}
                    onChange={e =>
                      handleArrayChange(
                        'experience',
                        index,
                        'company',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Position/Degree"
                    value={exp.position}
                    onChange={e =>
                      handleArrayChange(
                        'experience',
                        index,
                        'position',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={e =>
                      handleArrayChange(
                        'experience',
                        index,
                        'startDate',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={e =>
                      handleArrayChange(
                        'experience',
                        index,
                        'endDate',
                        e.target.value
                      )
                    }
                    disabled={exp.current}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={e =>
                      handleArrayChange(
                        'experience',
                        index,
                        'current',
                        e.target.checked
                      )
                    }
                  />
                  <span className="text-sm">Currently here</span>
                </label>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addArrayItem('experience', {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
              })
            }
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ),
    },
    {
      title: 'Education & Skills',
      description: 'Add your education and technical skills',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Education</h4>
            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Education {index + 1}</span>
                  {formData.education.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('education', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={e =>
                      handleArrayChange(
                        'education',
                        index,
                        'institution',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={e =>
                      handleArrayChange(
                        'education',
                        index,
                        'degree',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={edu.startDate}
                    onChange={e =>
                      handleArrayChange(
                        'education',
                        index,
                        'startDate',
                        e.target.value
                      )
                    }
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={edu.endDate}
                    onChange={e =>
                      handleArrayChange(
                        'education',
                        index,
                        'endDate',
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                addArrayItem('education', {
                  institution: '',
                  degree: '',
                  startDate: '',
                  endDate: '',
                })
              }
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">Technical Skills</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => {
                        const newSkills = formData.skills.filter(
                          (_, i) => i !== index
                        );
                        handleInputChange('skills', newSkills);
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Type a skill and press Enter"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (value && !formData.skills.includes(value)) {
                      handleInputChange('skills', [...formData.skills, value]);
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add skills as tags
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DialogStack open={isOpen} onOpenChange={setIsOpen}>
      <DialogStackOverlay className="backdrop-blur-[2px]" />
      <DialogStackBody>
        {sections.map((section, index) => (
          <DialogStackContent key={index}>
            <DialogStackHeader className="mt-2">
              <h1 className="text-2xl font-semibold leading-none tracking-tight">
                {section.title}
              </h1>
              <p className="text-black/50 dark:text-white/50">
                {section.description}
              </p>
            </DialogStackHeader>
            <div className="h-[400px] py-4 overflow-hidden">
              {section.content}
            </div>

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
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </DialogStackFooter>
          </DialogStackContent>
        ))}
      </DialogStackBody>
    </DialogStack>
  );
};

export default GlobalEditProfileDialog;
