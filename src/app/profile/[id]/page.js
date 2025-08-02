'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { authAPI } from '@/api/api';
import ProfileLeftSection from '@/components/ProfileLeftSection';
import ProfileRightSection from '@/components/ProfileRightSection';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile =
    session?.user?.username === id || session?.user?.id === id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (id) {
        try {
          console.log('Fetching user details for id:', id);
          // Try username first, fallback to userId for backward compatibility
          let response;
          if (id.includes('-')) {
            // Looks like a UUID, try userId endpoint
            response = await authAPI.getUserDetails(id);
          } else {
            // Looks like a username
            response = await authAPI.getUserByUsername(id);
          }
          console.log('User details response:', response);

          if (response.success && response.data) {
            setUserDetails(response.data);
            setError(null);

            // If we accessed via UUID but have username, redirect to username URL
            if (id.includes('-') && response.data.username) {
              window.history.replaceState(
                null,
                '',
                `/profile/${response.data.username}`
              );
            }
          } else {
            console.error('User not found or invalid response:', response);
            setError('User not found');
            setUserDetails(null);
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          setError('Failed to load user profile');
          setUserDetails(null);
        } finally {
          setIsLoading(false);
        }
      } else if (session?.user) {
        // If no id in params, show logged-in user's profile
        console.log('Using session user data:', session.user);
        setUserDetails(session.user);
        setIsLoading(false);
      } else {
        console.log('No id and no session user');
        setError('User not found');
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [id, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Skeleton for Left Section */}
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full bg-amber-500/10" />
              <Skeleton className="h-80 w-full bg-amber-500/10" />
              <Skeleton className="h-40 w-full bg-amber-500/10" />
            </div>
            {/* Skeleton for Right Section */}
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full bg-amber-500/10" />
              <Skeleton className="h-64 w-full bg-amber-500/10" />
              <Skeleton className="h-64 w-full bg-amber-500/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails && !isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            User Not Found
          </h2>
          <p className="text-muted-foreground">
            The user profile you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !userDetails)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-600 mb-4">
            User Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The user profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-1 space-y-6">
            <ProfileLeftSection
              userId={userDetails?.id}
              userDetails={userDetails}
              isOwnProfile={isOwnProfile}
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <ProfileRightSection
              userId={userDetails?.id}
              userDetails={userDetails}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
