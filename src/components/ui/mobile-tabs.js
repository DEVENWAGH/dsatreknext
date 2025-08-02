'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, Mic, MessageCircle, Medal, Eye } from 'lucide-react';

const MobileTabs = () => {
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
          id="radio-problems"
          name="navigation"
          type="radio"
          onChange={() => handleTabChange('/problems')}
        />
        <label htmlFor="radio-problems">
          <Trophy className="icon" />
          <span>Problems</span>
        </label>

        <input
          checked={pathname === '/interview'}
          id="radio-interview"
          name="navigation"
          type="radio"
          onChange={() => handleTabChange('/interview')}
        />
        <label htmlFor="radio-interview">
          <Mic className="icon" />
          <span>Interview</span>
        </label>

        <input
          checked={pathname.startsWith('/community')}
          id="radio-community"
          name="navigation"
          type="radio"
          onChange={() => handleTabChange('/community')}
        />
        <label htmlFor="radio-community">
          <MessageCircle className="icon" />
          <span>Community</span>
        </label>

        <input
          checked={pathname === '/contests'}
          id="radio-contests"
          name="navigation"
          type="radio"
          onChange={() => handleTabChange('/contests')}
        />
        <label htmlFor="radio-contests">
          <Medal className="icon" />
          <span>Contests</span>
        </label>

        <input
          checked={pathname === '/visualizer'}
          id="radio-visualizer"
          name="navigation"
          type="radio"
          onChange={() => handleTabChange('/visualizer')}
        />
        <label htmlFor="radio-visualizer">
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
  .radio-container {
    --main-color: #f7e479;
    --main-color-opacity: #f7e4791c;
    --total-radio: 5;

    display: flex;
    flex-direction: row;
    position: relative;
    width: 100%;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.05);
    margin: 1rem 0;
  }

  .radio-container input {
    cursor: pointer;
    appearance: none;
    flex: 1;
    height: 0;
  }

  .radio-container label {
    cursor: pointer;
    padding: 0.75rem 0;
    position: relative;
    color: grey;
    transition: all 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 0.75rem;
  }

  .radio-container label .icon {
    width: 1rem;
    height: 1rem;
    margin-bottom: 0.25rem;
  }

  .radio-container input:checked + label {
    color: var(--main-color);
  }

  .radio-container .glider-container {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
  }

  .radio-container .glider-container .glider {
    position: relative;
    width: calc(100% / var(--total-radio));
    height: 100%;
    background: var(--main-color);
    transition: transform 0.3s ease;
  }

  .radio-container .glider-container .glider::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 300%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--main-color);
    filter: blur(10px);
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

export default MobileTabs;
