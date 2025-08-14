'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Code2,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { problemAPI } from '@/api/api';
import Link from 'next/link';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminProblems() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    problem: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchProblems();
  }, [session, status, router]);

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const response = await problemAPI.getAll({ showAll: true });
      if (response.success && response.data?.problems) {
        setProblems(response.data.problems);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProblem = async () => {
    if (!deleteDialog.problem) return;

    try {
      setIsDeleting(true);
      const response = await problemAPI.delete(deleteDialog.problem.id);

      if (response.success) {
        toast.success('Problem deleted successfully');
        // Update state immediately for real-time UI update
        setProblems(prev => prev.filter(p => p.id !== deleteDialog.problem.id));
        setDeleteDialog({ open: false, problem: null });
      } else {
        toast.error(response.message || 'Failed to delete problem');
      }
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast.error('Failed to delete problem');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProblems.length === 0) return;

    try {
      setIsDeleting(true);
      const deletePromises = selectedProblems.map(id => problemAPI.delete(id));
      await Promise.all(deletePromises);

      toast.success(`${selectedProblems.length} problems deleted successfully`);
      setProblems(prev => prev.filter(p => !selectedProblems.includes(p.id)));
      setSelectedProblems([]);
      setBulkDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting problems:', error);
      toast.error('Failed to delete some problems');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = checked => {
    if (checked) {
      setSelectedProblems(filteredProblems.map(p => p.id));
    } else {
      setSelectedProblems([]);
    }
  };

  const handleSelectProblem = (problemId, checked) => {
    if (checked) {
      setSelectedProblems(prev => [...prev, problemId]);
    } else {
      setSelectedProblems(prev => prev.filter(id => id !== problemId));
    }
  };

  const handleToggleActive = async (problemId, currentStatus) => {
    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(
          `Problem ${!currentStatus ? 'enabled' : 'disabled'} successfully`
        );
        setProblems(prev =>
          prev.map(p =>
            p.id === problemId ? { ...p, isActive: !currentStatus } : p
          )
        );
      } else {
        toast.error('Failed to update problem status');
      }
    } catch (error) {
      console.error('Error updating problem status:', error);
      toast.error('Failed to update problem status');
    }
  };

  const filteredProblems = problems
    .filter(problem => {
      const matchesSearch =
        searchQuery === '' ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.tags || []).some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesDifficulty =
        difficultyFilter === 'all' ||
        problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'title') {
        // Extract number from title for proper numeric sorting
        const aNum = parseInt(a.title.match(/^(\d+)\./)?.[1] || '0');
        const bNum = parseInt(b.title.match(/^(\d+)\./)?.[1] || '0');
        aValue = aNum;
        bValue = bNum;
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Problem Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage coding problems
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/problems/create">
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search problems by title or tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px]">
                  <Filter className="w-4 h-4 mr-2" />
                  {difficultyFilter === 'all'
                    ? 'All Levels'
                    : difficultyFilter.charAt(0).toUpperCase() +
                      difficultyFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDifficultyFilter('all')}>
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDifficultyFilter('easy')}>
                  Easy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDifficultyFilter('medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDifficultyFilter('hard')}>
                  Hard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Problems Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Problems ({filteredProblems.length})
            </CardTitle>
            {selectedProblems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedProblems.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredProblems.length === 0 ? (
            <div className="text-center py-8">
              <Code2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No problems found</h3>
              <p className="text-muted-foreground">
                {searchQuery || difficultyFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first problem'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedProblems.length === filteredProblems.length &&
                        filteredProblems.length > 0
                      }
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (sortBy === 'title') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('title');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Title
                      {sortBy === 'title' && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Acceptance Rate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.map(problem => {
                  const totalSubmissions = parseInt(
                    problem.totalSubmissions || 0
                  );
                  const acceptedSubmissions = parseInt(
                    problem.acceptedSubmissions || 0
                  );
                  const acceptanceRate =
                    totalSubmissions > 0
                      ? (
                          (acceptedSubmissions / totalSubmissions) *
                          100
                        ).toFixed(1)
                      : '0.0';

                  return (
                    <TableRow
                      key={problem.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/workspace/${problem.id}`)}
                    >
                      <TableCell onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedProblems.includes(problem.id)}
                          onChange={e =>
                            handleSelectProblem(problem.id, e.target.checked)
                          }
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {typeof problem.description === 'string'
                            ? problem.description
                            : problem.description?.[0]?.children?.[0]?.text ||
                              'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            DIFFICULTY_COLORS[problem.difficulty?.toLowerCase()]
                          }
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={
                            problem.isActive !== false ? 'default' : 'secondary'
                          }
                          size="sm"
                          onClick={() =>
                            handleToggleActive(
                              problem.id,
                              problem.isActive !== false
                            )
                          }
                        >
                          {problem.isActive !== false ? 'Active' : 'Disabled'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(problem.tags || [])
                            .slice(0, 2)
                            .map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          {(problem.tags || []).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(problem.tags || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{totalSubmissions}</div>
                          <div className="text-muted-foreground">total</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{acceptanceRate}%</div>
                          <div className="text-muted-foreground">
                            {acceptedSubmissions} accepted
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(problem.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/workspace/${problem.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Problem
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/problems/${problem.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteDialog({ open: true, problem })
                              }
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={open =>
          setDeleteDialog({ open, problem: deleteDialog.problem })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Problem</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deleteDialog.problem?.title}&quot;? This action cannot be undone
              and will remove all associated submissions and discussions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, problem: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProblem}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Problem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Problems</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProblems.length} selected
              problems? This action cannot be undone and will remove all
              associated submissions and discussions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting
                ? 'Deleting...'
                : `Delete ${selectedProblems.length} Problems`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
