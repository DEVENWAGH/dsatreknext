'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  Building,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export default function AdminInterviews() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/interviews');
        if (response.ok) {
          const data = await response.json();
          setInterviews(data.data || []);

          // Calculate stats
          const total = data.data?.length || 0;
          const completed =
            data.data?.filter(i => i.status === 'completed').length || 0;
          const pending =
            data.data?.filter(i => i.status === 'pending').length || 0;
          const inProgress =
            data.data?.filter(i => i.status === 'in_progress').length || 0;

          setStats({ total, completed, pending, inProgress });
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const getStatusBadge = status => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="text-blue-600 bg-blue-100">
            <MessageSquare className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-full bg-background p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Interview Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage user interviews and view feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No interviews found</p>
            </CardContent>
          </Card>
        ) : (
          interviews.map(interview => (
            <Card
              key={interview.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {interview.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span>{interview.position || 'No position'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(
                          new Date(interview.createdAt),
                          'MMM dd, yyyy HH:mm'
                        )}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(interview.status)}
                </div>

                {interview.feedback && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">AI Feedback:</h4>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown className="text-sm">
                        {interview.feedback.substring(0, 200)}...
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/interview-details/${interview.id}`)
                    }
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
