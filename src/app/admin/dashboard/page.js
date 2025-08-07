'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Code2,
  FileCode2,
  CheckCircle2,
  Plus,
  Building,
  MessageSquare,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import LookerStudioReport from '@/components/LookerStudioReport';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const adminStore = useAdminStore();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const statsData = await adminStore.getTotalStats();
        setStats(statsData || adminStore.totalStats);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setStats(adminStore.totalStats); // Use cached data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]); // Removed adminStore from deps to prevent loops

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Problems',
      value: stats?.totalProblems || 0,
      icon: Code2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      icon: FileCode2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Accepted Submissions',
      value: stats?.acceptedSubmissions || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  // Prepare data for the charts
  const chartData = [
    { name: 'Users', value: stats?.totalUsers || 0 },
    { name: 'Problems', value: stats?.totalProblems || 0 },
    { name: 'Submissions', value: stats?.totalSubmissions || 0 },
    { name: 'Accepted', value: stats?.acceptedSubmissions || 0 },
  ];

  // Custom colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-full bg-background p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of platform statistics and metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(stat => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/admin/problems/create">
                <Plus className="w-4 h-4 mr-2" />
                Add New Problem
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/problems">
                <Code2 className="w-4 h-4 mr-2" />
                Manage Problems
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/companies">
                <Building className="w-4 h-4 mr-2" />
                Manage Companies
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/feedback">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Feedback
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/interviews">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Interviews
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Looker Studio Analytics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LookerStudioReport />
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.map(entry => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[chartData.indexOf(entry) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
