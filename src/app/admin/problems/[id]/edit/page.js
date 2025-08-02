'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Editor } from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelectTags } from '@/components/ui/multi-select-tags';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@radix-ui/react-accordion';
import { toast } from 'sonner';
import { PROBLEM_TAGS } from '@/utils/problemTags';
import { ProblemEditor } from '@/components/ProblemEditor';
import { useLanguageStore } from '@/store/languageStore';
import {
  hasPlateContent,
  getPlateContentSummary,
} from '@/utils/plateValidation';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  difficulty: z.enum(
    ['easy', 'medium', 'hard', 'premium'],
    'Invalid difficulty'
  ),
  tags: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
  testCases: z
    .array(
      z.object({
        input: z.string().optional(),
        output: z.string().optional(),
      })
    )
    .optional(),
  starterCode: z.record(z.string(), z.string().optional()).optional(),
  topCode: z.record(z.string(), z.string().optional()).optional(),
  bottomCode: z.record(z.string(), z.string().optional()).optional(),
  referenceSolution: z.record(z.string(), z.string().optional()).optional(),
});

export default function EditProblem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [hints, setHints] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize with proper structure for PlateJS
  const [description, setDescription] = useState([
    { type: 'p', children: [{ text: '' }] },
  ]);
  const [editorial, setEditorial] = useState([
    { type: 'p', children: [{ text: '' }] },
  ]);

  // Add callback handlers for editor content changes
  const handleDescriptionChange = newContent => {
    setDescription(newContent);
  };

  const handleEditorialChange = newContent => {
    setEditorial(newContent);
  };

  const { getSupportedLanguagesForAdmin } = useLanguageStore();
  const SUPPORTED_LANGUAGES = getSupportedLanguagesForAdmin
    ? getSupportedLanguagesForAdmin()
    : [
        {
          key: 'JAVASCRIPT',
          displayName: 'JavaScript',
          monacoLanguage: 'javascript',
        },
        { key: 'PYTHON', displayName: 'Python', monacoLanguage: 'python' },
        { key: 'JAVA', displayName: 'Java', monacoLanguage: 'java' },
        { key: 'CPP', displayName: 'C++', monacoLanguage: 'cpp' },
      ];

  // Helper function to get Monaco language
  const getMonacoLanguage = key => {
    const language = SUPPORTED_LANGUAGES.find(l => l.key === key);
    return language ? language.monacoLanguage : 'javascript';
  };

  const form = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      difficulty: 'easy',
      tags: [],
      companies: [],
      hints: [''],
      testCases: [{ input: '', output: '' }],
      starterCode: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])
      ),
      topCode: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])
      ),
      bottomCode: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])
      ),
      referenceSolution: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])
      ),
    },
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control: form.control,
    name: 'testCases',
  });

  const fetchData = useCallback(async () => {
    if (!params.id) return;

    try {
      setIsLoading(true);

      // Fetch companies and problem data
      const [companiesResponse, problemResponse] = await Promise.all([
        fetch('/api/companies'),
        fetch(`/api/problems/${params.id}`),
      ]);

      const companiesData = await companiesResponse.json();
      const problemData = await problemResponse.json();

      if (companiesData.success) {
        setCompanies(companiesData.data);
      }

      if (problemData.success) {
        const problemInfo = problemData.problem;

        // Populate form with existing data
        form.reset({
          title: problemInfo.title || '',
          difficulty: problemInfo.difficulty?.toLowerCase() || 'easy',
          testCases:
            problemInfo.testCases?.length > 0
              ? problemInfo.testCases
              : [{ input: '', output: '' }],
          starterCode:
            problemInfo.starterCode ||
            Object.fromEntries(SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])),
          topCode:
            problemInfo.topCode ||
            Object.fromEntries(SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])),
          bottomCode:
            problemInfo.bottomCode ||
            Object.fromEntries(SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])),
          referenceSolution:
            problemInfo.solution ||
            Object.fromEntries(SUPPORTED_LANGUAGES.map(lang => [lang.key, ''])),
        });

        // Set selected companies and tags
        setSelectedCompanies(problemInfo.companies || []);
        setSelectedTags(problemInfo.tags || []);
        setHints(problemInfo.hints?.length > 0 ? problemInfo.hints : ['']);

        // Set description and editorial
        if (problemInfo.description) {
          setDescription(problemInfo.description);
        }
        if (problemInfo.editorial) {
          setEditorial(problemInfo.editorial);
        }

        // Set premium status
        setIsPremium(problemInfo.isPremium || false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch problem data');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [session, status, router, params.id]);

  const onSubmit = async data => {
    try {
      setIsSubmitting(true);

      // Use the improved validation utility
      const hasDescriptionContent = hasPlateContent(description);

      if (!hasDescriptionContent) {
        toast.error('Please add a problem description');
        return;
      }

      const processedData = {
        title: data.title,
        description: description,
        editorial: hasPlateContent(editorial) ? editorial : null,
        difficulty: data.difficulty,
        tags: selectedTags,
        companies: selectedCompanies,
        hints: hints.filter(hint => hint.trim() !== ''),
        testCases: data.testCases
          ? data.testCases.filter(tc => tc.input || tc.output).slice(0, 3)
          : [],
        starterCode: Object.fromEntries(
          Object.entries(data.starterCode || {}).filter(([, value]) =>
            value?.trim()
          )
        ),
        topCode: Object.fromEntries(
          Object.entries(data.topCode || {}).filter(([, value]) =>
            value?.trim()
          )
        ),
        bottomCode: Object.fromEntries(
          Object.entries(data.bottomCode || {}).filter(([, value]) =>
            value?.trim()
          )
        ),
        referenceSolution: Object.fromEntries(
          Object.entries(data.referenceSolution || {}).filter(([, value]) =>
            value?.trim()
          )
        ),
        isPremium: isPremium,
      };

      const response = await fetch(`/api/problems/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Problem updated successfully!');
        router.push('/admin/problems');
      } else {
        toast.error(result.message || 'Failed to update problem');
      }
    } catch (error) {
      console.error('Error updating problem:', error);
      toast.error('Error updating problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    status === 'loading' ||
    isLoading ||
    !session ||
    session.user.role !== 'admin'
  ) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="py-4 border-b">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Problem Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="w-64">
                    <FormControl>
                      <MultiSelectTags
                        tags={PROBLEM_TAGS}
                        selectedTags={selectedTags}
                        onTagsChange={newTags => {
                          setSelectedTags(newTags);
                          field.onChange(newTags);
                        }}
                        placeholder="Tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companies"
                render={({ field }) => (
                  <FormItem className="w-64">
                    <FormControl>
                      <MultiSelectTags
                        tags={companies.map(c => c.name)}
                        selectedTags={selectedCompanies.map(id => {
                          const company = companies.find(c => c.id === id);
                          return company ? company.name : id;
                        })}
                        onTagsChange={newCompanyNames => {
                          const newCompanyIds = newCompanyNames.map(name => {
                            const company = companies.find(
                              c => c.name === name
                            );
                            return company ? company.id : name;
                          });
                          setSelectedCompanies(newCompanyIds);
                          field.onChange(newCompanyIds);
                        }}
                        placeholder="Companies"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="premium-toggle"
                  checked={isPremium}
                  onCheckedChange={setIsPremium}
                />
                <Label htmlFor="premium-toggle" className="text-sm font-medium">
                  Premium Problem
                </Label>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Test Cases (Examples - Max 3)</Label>
              {testCaseFields.slice(0, 3).map((testCase, index) => (
                <div key={testCase.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`testCases.${index}.input`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`testCases.${index}.output`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Output" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestCase(index)}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Badge variant="outline" className="ml-2">
                    Example {index + 1}
                  </Badge>
                </div>
              ))}
              {testCaseFields.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendTestCase({ input: '', output: '' })}
                >
                  Add Test Case
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hints</Label>
              {hints.map((hint, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder={`Hint ${index + 1}`}
                    value={hint}
                    onChange={e => {
                      const newHints = [...hints];
                      newHints[index] = e.target.value;
                      setHints(newHints);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newHints = hints.filter((_, i) => i !== index);
                      setHints(newHints);
                    }}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setHints([...hints, ''])}
              >
                Add Hint
              </Button>
            </div>

            {/* Collapsible All-Languages Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">
                All Languages Code Overview
              </h2>
              <Accordion type="multiple" className="w-full">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <AccordionItem key={lang.key} value={lang.key}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Image
                          src={lang.icon || '/icons/default-lang.svg'}
                          alt={`${lang.displayName} icon`}
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                        <span className="font-bold">{lang.displayName}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-4">
                        <FormField
                          control={form.control}
                          name={`starterCode.${lang.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Starter Code (User sees this)
                              </FormLabel>
                              <FormControl>
                                <Editor
                                  height="150px"
                                  language={getMonacoLanguage(lang.key)}
                                  value={field.value || ''}
                                  onChange={value =>
                                    field.onChange(value || '')
                                  }
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    readOnly: false,
                                    domReadOnly: false,
                                  }}
                                  theme="vs-dark"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mb-4">
                        <FormField
                          control={form.control}
                          name={`topCode.${lang.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Top Code (Imports/Input parsing)
                              </FormLabel>
                              <FormControl>
                                <Editor
                                  height="120px"
                                  language={getMonacoLanguage(lang.key)}
                                  value={field.value || ''}
                                  onChange={value =>
                                    field.onChange(value || '')
                                  }
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                  }}
                                  theme="vs-dark"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mb-4">
                        <FormField
                          control={form.control}
                          name={`bottomCode.${lang.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Bottom Code (Test runner/Output)
                              </FormLabel>
                              <FormControl>
                                <Editor
                                  height="120px"
                                  language={getMonacoLanguage(lang.key)}
                                  value={field.value || ''}
                                  onChange={value =>
                                    field.onChange(value || '')
                                  }
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                  }}
                                  theme="vs-dark"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={form.control}
                          name={`referenceSolution.${lang.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Reference Solution
                              </FormLabel>
                              <FormControl>
                                <Editor
                                  height="150px"
                                  language={getMonacoLanguage(lang.key)}
                                  value={field.value || ''}
                                  onChange={value =>
                                    field.onChange(value || '')
                                  }
                                  options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                  }}
                                  theme="vs-dark"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </form>
        </Form>
      </div>
      <div className="flex-1">
        <ProblemEditor
          onDescriptionChange={handleDescriptionChange}
          onEditorialChange={handleEditorialChange}
          initialDescription={description}
          initialEditorial={editorial}
        />
      </div>
    </div>
  );
}
