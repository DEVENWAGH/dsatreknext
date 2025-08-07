import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  FileText,
  Target,
  Clock,
  BarChart2,
  Loader2,
} from 'lucide-react';

const formSchema = z.object({
  jobPosition: z.string().min(2, 'Job position must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  jobDescription: z
    .string()
    .min(10, 'Job description must be at least 10 characters'),
  interviewType: z.string().min(1, 'Please select an interview type'),
  duration: z.string().min(1, 'Please select a duration'),
  interviewDifficulty: z.string().min(1, 'Please select a difficulty level'),
});

const InterviewForm = ({ onSubmit, isCreating }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobPosition: '',
      companyName: '',
      jobDescription: '',
      interviewType: '',
      duration: '',
      interviewDifficulty: '',
    },
  });

  // Check for retry configuration on component mount (deprecated)
  useEffect(() => {
    // This is now handled by direct interview reset functionality
    // Old sessionStorage retry approach is deprecated in favor of direct interview reuse
    try {
      const retryConfig = sessionStorage.getItem('retryInterviewConfig');
      if (retryConfig) {
        // Clear the deprecated config
        sessionStorage.removeItem('retryInterviewConfig');
        console.log(
          '🗑️ Cleared deprecated retry configuration - now using direct interview reuse'
        );
      }
    } catch (error) {
      console.error('Error clearing deprecated retry configuration:', error);
    }
  }, [form]);

  const interviewTypes = [
    { value: 'Technical Interview', icon: <Target className="w-4 h-4" /> },
    { value: 'Behavioral Interview', icon: <BarChart2 className="w-4 h-4" /> },
    {
      value: 'System Design Interview',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      value: 'Problem Solving Interview',
      icon: <Target className="w-4 h-4" />,
    },
    { value: 'Leadership Interview', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const durations = [
    { value: '2 min', label: '2 minutes' },
    { value: '5 min', label: '5 minutes' },
    { value: '10 min', label: '10 minutes' },
    { value: '15 min', label: '15 minutes' },
    { value: '30 min', label: '30 minutes' },
    { value: '45 min', label: '45 minutes' },
    { value: '1 hr', label: '1 hour' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'hard', label: 'Hard', color: 'text-red-500' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <FormField
          control={form.control}
          name="jobPosition"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Position
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Node.js Backend Developer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Company Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Google, Amazon, Microsoft"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter job description"
                  className="resize-none max-h-24 overflow-y-auto custom-scrollbar"
                  rows={3}
                  data-lenis-prevent
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interviewType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Interview Type
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {interviewTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          {type.icon}
                          {type.value}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {durations.map(duration => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interviewDifficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Difficulty
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem
                      key={difficulty.value}
                      value={difficulty.value}
                      className={difficulty.color}
                    >
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full mt-6" disabled={isCreating}>
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Interview...
            </div>
          ) : (
            'Create Interview'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default InterviewForm;
