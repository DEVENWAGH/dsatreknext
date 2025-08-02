'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, Mic, MessageCircle, Medal, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DesktopTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = route => {
    router.push(route);
  };

  return (
    <StyledWrapper>
      <div className="radio-container">
        <input
          checked={pathname === '/problems'}
          id="desktop-problems"
          name="desktop-nav"
          type="radio"
          onChange={() => handleTabChange('/problems')}
        />
        <label htmlFor="desktop-problems">
          <Trophy className="icon" />
          <span>Problems</span>
        </label>

        <input
          checked={pathname === '/interview'}
          id="desktop-interview"
          name="desktop-nav"
          type="radio"
          onChange={() => handleTabChange('/interview')}
        />
        <label htmlFor="desktop-interview">
          <Mic className="icon" />
          <span>Interview</span>
          <Badge className="ml-1 text-xs text-green-600 bg-green-500/20">
            AI
          </Badge>
        </label>

        <input
          checked={pathname.startsWith('/community')}
          id="desktop-community"
          name="desktop-nav"
          type="radio"
          onChange={() => handleTabChange('/community')}
        />
        <label htmlFor="desktop-community">
          <MessageCircle className="icon" />
          <span>Community</span>
        </label>

        <input
          checked={pathname === '/contests'}
          id="desktop-contests"
          name="desktop-nav"
          type="radio"
          onChange={() => handleTabChange('/contests')}
        />
        <label htmlFor="desktop-contests">
          <Medal className="icon" />
          <span>Contests</span>
        </label>

        <input
          checked={pathname === '/visualizer'}
          id="desktop-visualizer"
          name="desktop-nav"
          type="radio"
          onChange={() => handleTabChange('/visualizer')}
        />
        <label htmlFor="desktop-visualizer">
          <Eye className="icon" />
          <span>Visualizer</span>
        </label>

        <div className="glider-container">
          <div className="glider" />
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;

  .radio-container {
    --main-color: #f59e0b;
    --main-color-opacity: #f59e0b1c;

    display: flex;
    flex-direction: row;
    position: relative;
    height: 40px;
    width: 100%;
  }

  .radio-container input {
    cursor: pointer;
    appearance: none;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
  }

  .radio-container .glider-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    width: 100%;
  }

  .radio-container .glider-container .glider {
    position: relative;
    width: 20%; /* Exactly 1/5 of the container */
    height: 100%;
    background: var(--main-color);
    transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
  }

  .radio-container .glider-container .glider::before {
    content: '';
    position: absolute;
    width: 60%;
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    background: var(--main-color);
    filter: blur(3px);
  }

  .radio-container label {
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    position: relative;
    color: grey;
    transition: all 0.3s ease-in-out;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    justify-content: center;
    text-align: center;
    width: 20%;
    min-width: 0;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .radio-container input:checked + label {
    color: var(--main-color);
  }

  .radio-container label .icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .radio-container input:nth-of-type(1):checked ~ .glider-container .glider {
    transform: translateX(0);
  }

  .radio-container input:nth-of-type(2):checked ~ .glider-container .glider {
    transform: translateX(100%);
  }

  .radio-container input:nth-of-type(3):checked ~ .glider-container .glider {
    transform: translateX(200%);
  }

  .radio-container input:nth-of-type(4):checked ~ .glider-container .glider {
    transform: translateX(300%);
  }

  .radio-container input:nth-of-type(5):checked ~ .glider-container .glider {
    transform: translateX(400%);
  }
`;

export default DesktopTabs;
