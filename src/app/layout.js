import './globals.css';
import './visualizer/dsatrek-theme.css';
import 'lenis/dist/lenis.css';
import { Providers } from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import PropTypes from 'prop-types';
import { GoogleAnalytics } from '@next/third-parties/google';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import LenisFramerMotion from '@/components/LenisFramerMotion';
import LayoutWrapper from '@/components/LayoutWrapper';
import localFont from 'next/font/local';
import { metadata } from './metadata';

const gilroy = localFont({
  src: '../fonts/Gilroy-Regular.ttf',
  variable: '--font-gilroy',
  display: 'swap',
});

const akashi = localFont({
  src: '../fonts/Akashi.ttf',
  variable: '--font-akashi',
  display: 'swap',
});

// Import room cleanup service to start background cleanup
import '@/lib/roomCleanup';

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${gilroy.variable} ${akashi.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <ErrorBoundary>
            <LenisFramerMotion>
              <LayoutWrapper>{children}</LayoutWrapper>
            </LenisFramerMotion>
          </ErrorBoundary>
        </Providers>
        <GoogleAnalytics gaId="G-R6N78MTMLW" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
