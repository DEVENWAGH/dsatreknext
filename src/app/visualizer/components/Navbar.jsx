import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styled from 'styled-components';
import { useLogo } from '@/hooks/useLogo';
import useAlgorithmStore from '@/store/algorithmStore';
import MobileSidebar from './MobileSidebar';
import { ModeToggle } from '@/components/ui/mode-toggle';

const Navbar = () => {
  const router = useRouter();
  const logoSrc = useLogo();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const {
    currentAlgorithm,
    searchQuery,
    setSearchQuery,
    searchAlgorithms,
    searchResults,
    setCurrentAlgorithm,
    algorithmCategories,
  } = useAlgorithmStore();

  const handleSearch = e => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAlgorithms(query);
  };

  const handleAlgorithmClick = algorithm => {
    const category = Object.keys(algorithmCategories).find(cat =>
      algorithmCategories[cat].includes(algorithm)
    );
    if (category) {
      const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
      const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, '-');
      const urlPath = `/visualizer?category=${categoryPath}&algorithm=${algorithmPath}`;
      setCurrentAlgorithm(algorithm);
      setSearchQuery('');
      setShowMobileSidebar(false);
      router.push(urlPath);
    }
  };

  return (
    <>
      <nav className="visualizer-navbar fixed h-38 md:h-auto top-0 left-0 right-0 shadow-lg z-50">
        <div className="container flex flex-col md:flex-row items-center justify-between mx-auto p-4 mt-0">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1">
              <Image
                src="/dsaD.svg"
                alt="D"
                width={16}
                height={16}
                className="logo-d hover:filter hover:drop-shadow-[0_0_10px_#38bdf8] transition-all duration-300"
              />
              <span className="logo-text text-lg font-semibold leading-none">
                SATrek
              </span>
            </a>
            <div className="border-l border-sky-500/30 pl-4">
              <a href="/visualizer" className="block">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 transition-all duration-300">
                  Algorithm Arena
                </h1>
                <p className="text-sm italic text-sky-400/80 animate-pulse hover:text-sky-300 transition-colors duration-300">
                  Feel the heartbeat of Visualize DSA
                </p>
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-2 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search algorithms..."
                value={searchQuery}
                onChange={handleSearch}
                className="visualizer-input w-64 px-4 py-2 pl-10 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-ring backdrop-blur-sm"
              />
              <svg
                className="absolute w-4 h-4 text-gray-400 left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <div className="dropdown-menu absolute z-10 w-full mt-2 rounded-lg shadow-lg">
                  {searchResults.map(result => (
                    <button
                      key={result.name}
                      onClick={() => handleAlgorithmClick(result.name)}
                      className="block w-full px-4 py-2 text-left text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {result.name}{' '}
                      <span className="text-sm text-muted-foreground">
                        ({result.category})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ModeToggle />

            <StyledWrapper>
              <a
                className="codepen-button"
                onClick={() => setShowMobileSidebar(true)}
                style={{ cursor: 'pointer' }}
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="inline-block mr-2"
                  >
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                  {currentAlgorithm || 'Explore Algorithms'}
                </span>
              </a>
            </StyledWrapper>
          </div>
        </div>
      </nav>

      <MobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />
    </>
  );
};

export default Navbar;

const StyledWrapper = styled.div`
  .codepen-button {
    display: block;
    cursor: pointer;
    color: white;
    margin: 0 auto;
    position: relative;
    text-decoration: none;
    font-weight: 600;
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 2px;
    isolation: isolate;
  }

  .codepen-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 400%;
    height: 100%;
    background: linear-gradient(115deg, #d1d1d1, #02367b, #a7bfde);
    background-size: 25% 100%;
    animation: border-animation 0.75s linear infinite;
    animation-play-state: running;
    translate: -5% 0%;
    transition: translate 0.25s ease-out;
  }

  .codepen-button:hover::before {
    animation-play-state: running;
    transition-duration: 0.75s;
    translate: 0% 0%;
  }

  @keyframes border-animation {
    to {
      transform: translateX(-25%);
    }
  }

  .codepen-button span {
    position: relative;
    display: block;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    background: #02367b;
    border-radius: 0.5rem;
    height: 100%;
    font-weight: 500;
  }
`;
