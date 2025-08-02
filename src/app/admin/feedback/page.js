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
  Mail,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminFeedback() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
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
        const response = await fetch(
          `/api/feedback?status=${statusFilter}&limit=100`
        );
        if (response.ok) {
          const data = await response.json();
          setFeedback(data.data || []);

          // Calculate stats
          const total = data.data?.length || 0;
          const pending =
            data.data?.filter(f => f.status === 'pending').length || 0;
          const reviewed =
            data.data?.filter(f => f.status === 'reviewed').length || 0;
          const resolved =
            data.data?.filter(f => f.status === 'resolved').length || 0;

          setStats({ total, pending, reviewed, resolved });
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, statusFilter]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/feedback?status=${statusFilter}&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data || []);

        // Calculate stats
        const total = data.data?.length || 0;
        const pending =
          data.data?.filter(f => f.status === 'pending').length || 0;
        const reviewed =
          data.data?.filter(f => f.status === 'reviewed').length || 0;
        const resolved =
          data.data?.filter(f => f.status === 'resolved').length || 0;

        setStats({ total, pending, reviewed, resolved });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeedbackStatus = async (id, newStatus) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setFeedback(prev =>
          prev.map(f =>
            f.id === id
              ? { ...f, status: newStatus, updatedAt: new Date().toISOString() }
              : f
          )
        );
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const deleteFeedback = async id => {
    if (
      !confirm(
        'Are you sure you want to delete this feedback? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFeedback(prev => prev.filter(f => f.id !== id));
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="secondary" className="text-blue-600 bg-blue-100">
            <MessageSquare className="w-3 h-3 mr-1" />
            Reviewed
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
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
          Feedback Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage user feedback and support requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feedback
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviewed
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.reviewed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback found</p>
            </CardContent>
          </Card>
        ) : (
          feedback.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {item.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{item.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="mb-4">
                  <p className="text-foreground leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {item.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateFeedbackStatus(item.id, 'reviewed')
                        }
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateFeedbackStatus(item.id, 'resolved')
                        }
                      >
                        Mark as Resolved
                      </Button>
                    </>
                  )}
                  {item.status === 'reviewed' && (
                    <Button
                      size="sm"
                      onClick={() => updateFeedbackStatus(item.id, 'resolved')}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {item.status === 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateFeedbackStatus(item.id, 'pending')}
                    >
                      Reopen
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteFeedback(item.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
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
