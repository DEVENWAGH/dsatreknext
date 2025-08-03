'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useAuthStore } from '@/store/authStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { users, isLoading, getAllUsers, changeRole, deleteUser } =
    useAdminStore();
  const { authUser } = useAuthStore();
  const [changingRole, setChangingRole] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const loadUsers = async (page = 1) => {
    try {
      const response = await getAllUsers({ page, limit: 10 });
      if (response?.pagination) {
        setTotalPages(response.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleRoleChange = async userId => {
    if (!authUser) {
      toast.error('You must be logged in to change roles');
      return;
    }

    try {
      setChangingRole(true);
      const response = await changeRole(userId);
      if (response?.data?.success) {
        toast.success(response.data.message);
        // Refresh the users list
        await loadUsers(currentPage);
      } else {
        toast.error(response?.data?.message || 'Failed to change role');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change role');
    } finally {
      setChangingRole(false);
    }
  };

  const handleDelete = async userId => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setChangingRole(true);
      await deleteUser(userId);
      toast.success('User deleted successfully');
      await loadUsers(currentPage);
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setChangingRole(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="h-full bg-background p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-full bg-background p-6">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Username</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          Loading users...
                        </td>
                      </tr>
                    );
                  }

                  if (users.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          No users found
                        </td>
                      </tr>
                    );
                  }

                  return users.map(user => {
                    // Combine firstName and lastName to create full name
                    const fullName =
                      [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      user.username ||
                      'N/A';

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="p-4 font-medium">{fullName}</td>
                        <td className="p-4">{user.username || 'N/A'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`role-${user.id}`}
                                checked={user.role === 'admin'}
                                onCheckedChange={() =>
                                  handleRoleChange(user.id)
                                }
                                disabled={
                                  changingRole || user.id === authUser?.id
                                }
                              />
                              <Label
                                htmlFor={`role-${user.id}`}
                                className="text-xs"
                              >
                                Toggle
                              </Label>
                            </div>
                            {user.id !== authUser?.id && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                disabled={changingRole}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => loadUsers(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1 bg-primary text-primary-foreground rounded disabled:opacity-50 hover:bg-primary/90"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => loadUsers(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1 bg-primary text-primary-foreground rounded disabled:opacity-50 hover:bg-primary/90"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
