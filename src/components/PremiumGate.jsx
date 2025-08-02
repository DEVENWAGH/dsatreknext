import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SubscribeButton from '@/components/ui/subscribe-button';

export default function PremiumGate() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubscribe = () => {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md p-8 bg-background/90 rounded-lg border shadow-lg">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">🔒</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Subscribe to unlock
          </h2>
          <p className="text-muted-foreground mb-4">
            Thanks for using DSATrek! To view this question you must subscribe
            to premium.
          </p>
        </div>
        <div className="flex justify-center">
          <SubscribeButton onClick={handleSubscribe} planLabel="Subscribe" />
        </div>
      </div>
    </div>
  );
}
