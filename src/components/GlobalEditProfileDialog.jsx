import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CustomAvatarFallback from '@/components/ui/avatar-fallback';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, X, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/stacked-dialog";

const GlobalEditProfileDialog = () => {
  const { data: session } = useSession();
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
    experience: [{ company: '', position: '', startDate: '', endDate: '', current: false }],
    education: [{ institution: '', degree: '', startDate: '', endDate: '' }],
    skills: []
  });
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const handleOpenEdit = () => {
      setIsOpen(true);
      fetchUserData();
    };

    window.addEventListener('openEditProfile', handleOpenEdit);
    return () => window.removeEventListener('openEditProfile', handleOpenEdit);
  }, []);

  const fetchUserData = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData); // Debug log
        if (userData.success) {
          const user = userData.data;
          console.log('Username from API:', user.username); // Debug username
          setUserAvatar(user.profilePicture);
          setFormData({
            username: user.username || session?.user?.username || '',
            gender: user.gender || '',
            location: user.location || '',
            birthday: user.birthday || '',
            summary: user.summary || '',
            website: user.websiteUrl || user.website || '',
            github: user.github || '',
            linkedin: user.linkedin || '',
            twitter: user.twitterUrl || user.twitter || '',
            experience: user.experience ? (typeof user.experience === 'string' ? JSON.parse(user.experience) : user.experience) : [{ company: '', position: '', startDate: '', endDate: '', current: false }],
            education: user.education ? (typeof user.education === 'string' ? JSON.parse(user.education) : user.education) : [{ institution: '', degree: '', startDate: '', endDate: '' }],
            skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : []
          });
        }
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
      )
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setIsOpen(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const sections = [
    {
      title: "Basic Info",
      description: "Update your personal information",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Gender</label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="not-disclosed">Prefer not to disclose</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="India, Maharashtra, Panvel"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Birthday</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.birthday && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.birthday ? format(new Date(formData.birthday), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.birthday ? new Date(formData.birthday) : undefined}
                  onSelect={(date) => handleInputChange('birthday', date ? format(date, 'yyyy-MM-dd') : '')}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ),
    },
    {
      title: "About & Links",
      description: "Tell us about yourself and add social links",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Tell us about yourself (interests, experience, etc.)"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">GitHub</label>
            <Input
              value={formData.github}
              onChange={(e) => handleInputChange('github', e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <Input
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">X (Twitter)</label>
            <Input
              value={formData.twitter}
              onChange={(e) => handleInputChange('twitter', e.target.value)}
              placeholder="https://x.com/username"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Experience",
      description: "Add your work experience",
      content: (
        <div className="space-y-4">
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
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                />
                <Input
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={exp.startDate}
                  onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={exp.endDate}
                  onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                  disabled={exp.current}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => handleArrayChange('experience', index, 'current', e.target.checked)}
                />
                <span className="text-sm">Currently working here</span>
              </label>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addArrayItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ),
    },
    {
      title: "Education & Skills",
      description: "Add your education and technical skills",
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
                    onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={edu.startDate}
                    onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={edu.endDate}
                    onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('education', { institution: '', degree: '', startDate: '', endDate: '' })}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium">Technical Skills</label>
            <Textarea
              value={formData.skills.join(', ')}
              onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Java, JavaScript, React, Next.js, Python..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
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
            <DialogStackHeader className="mt-2 flex flex-row items-center gap-2">
              {userAvatar || session?.user?.image ? (
                <Avatar>
                  <AvatarImage
                    src={userAvatar || session?.user?.image}
                    alt={session?.user?.name || session?.user?.username}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                    {(session?.user?.name || session?.user?.username)?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <CustomAvatarFallback
                  name={session?.user?.name || session?.user?.username}
                  size={48}
                  className="border-2 border-border"
                />
              )}
              <div>
                <h1 className="text-2xl font-semibold leading-none tracking-tight">
                  {section.title}
                </h1>
                <p className="text-black/50 dark:text-white/50">
                  {section.description}
                </p>
              </div>
            </DialogStackHeader>

            <div className="min-h-[300px] py-4">
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
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
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