import Head from 'next/head';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';

const Seo = ({ title, description, keywords, image }) => {
  const pathname = usePathname();
  const baseUrl = 'https://coder-army-algo-arena.vercel.app';
  const url = `${baseUrl}${pathname}`;

  // Default values
  const defaultTitle = 'Algorithm Arena - Interactive Algorithm Visualization';
  const defaultDescription =
    'Visualize and learn algorithms through interactive animations. Compare algorithm performance in real-time with our unique Race Mode.';
  const defaultKeywords =
    'algorithms, data structures, visualization, sorting, searching, graphs, educational tool';
  const defaultImage = '/og-image.png';

  // Use provided values or defaults
  const pageTitle = title ? `${title} | Algorithm Arena` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageImage = `${baseUrl}${image || defaultImage}`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />
      <link rel="canonical" href={url} />
    </Head>
  );
};

// Add PropTypes validation
Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
};

export default Seo;
