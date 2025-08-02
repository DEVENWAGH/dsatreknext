'use client';

import { useState, useEffect } from 'react';
import { useProblemStore } from '@/store/problemStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDailyChallenges = () => {
  const { problems, getAllProblems } = useProblemStore();
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [premiumProblem, setPremiumProblem] = useState('');
  const [premiumWeek, setPremiumWeek] = useState('');

  useEffect(() => {
    getAllProblems();
    fetchChallenges();
  }, [getAllProblems]);

  const fetchChallenges = async () => {
    try {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const response = await fetch(
        `/api/daily-challenges?month=${currentMonth}`
      );
      const data = await response.json();
      setChallenges(Object.values(data.challenges || {}));
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const addChallenge = async () => {
    if (!selectedProblem || !selectedDate) {
      toast.error('Please select both problem and date');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/daily-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem,
          challengeDate: selectedDate,
        }),
      });

      if (response.ok) {
        toast.success('Daily challenge added successfully');
        setSelectedProblem('');
        setSelectedDate('');
        fetchChallenges();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add challenge');
      }
    } catch (error) {
      toast.error('Error adding challenge');
    } finally {
      setLoading(false);
    }
  };

  const addPremiumChallenge = async () => {
    if (!premiumProblem || !premiumWeek) {
      toast.error('Please select both problem and week');
      return;
    }

    // Find the nth Sunday of current month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekNumber = parseInt(premiumWeek.replace('W', ''));

    let sundayCount = 0;
    let challengeDate = '';

    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;

      if (date.getDay() === 0) {
        // Sunday
        sundayCount++;
        if (sundayCount === weekNumber) {
          challengeDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          break;
        }
      }
    }

    if (!challengeDate) {
      toast.error('No Sunday found for selected week');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/daily-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: premiumProblem,
          challengeDate,
        }),
      });

      if (response.ok) {
        toast.success('Weekly Premium challenge added successfully');
        setPremiumProblem('');
        setPremiumWeek('');
        fetchChallenges();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add premium challenge');
      }
    } catch (error) {
      toast.error('Error adding premium challenge');
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async challengeId => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/daily-challenges?id=${challengeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Challenge deleted successfully');
        fetchChallenges();
      } else {
        toast.error('Failed to delete challenge');
      }
    } catch (error) {
      toast.error('Error deleting challenge');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthChallenges = async () => {
    if (!problems.length) return;

    setLoading(true);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    try {
      for (let day = 1; day <= daysInMonth; day++) {
        const randomProblem =
          problems[Math.floor(Math.random() * problems.length)];
        const challengeDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        await fetch('/api/daily-challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: randomProblem.id,
            challengeDate,
          }),
        });
      }

      toast.success('Month challenges generated successfully');
      fetchChallenges();
    } catch (error) {
      toast.error('Error generating challenges');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Daily Challenge Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Challenge Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Daily Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Problem</label>
              <Select
                value={selectedProblem}
                onValueChange={setSelectedProblem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a problem" />
                </SelectTrigger>
                <SelectContent>
                  {problems.map(problem => (
                    <SelectItem key={problem.id} value={problem.id}>
                      {problem.title} ({problem.difficulty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Challenge Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addChallenge}
                disabled={loading}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Challenge
              </Button>
              <Button
                onClick={generateMonthChallenges}
                disabled={loading}
                variant="outline"
              >
                Generate Month
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {challenges.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No challenges for this month
                </p>
              ) : (
                challenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{challenge.problem?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Day {challenge.day} • {challenge.problem?.difficulty}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteChallenge(challenge.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Premium Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">
              Weekly Premium Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Problem</label>
              <Select value={premiumProblem} onValueChange={setPremiumProblem}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a premium problem" />
                </SelectTrigger>
                <SelectContent>
                  {problems
                    .filter(problem => problem.is_premium === true)
                    .map(problem => (
                      <SelectItem key={problem.id} value={problem.id}>
                        {problem.title} ({problem.difficulty})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Week</label>
              <Select value={premiumWeek} onValueChange={setPremiumWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="W1">Week 1 (W1)</SelectItem>
                  <SelectItem value="W2">Week 2 (W2)</SelectItem>
                  <SelectItem value="W3">Week 3 (W3)</SelectItem>
                  <SelectItem value="W4">Week 4 (W4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={addPremiumChallenge}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Premium Challenge
            </Button>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Premium challenges unlock on Sundays for premium users only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDailyChallenges;
