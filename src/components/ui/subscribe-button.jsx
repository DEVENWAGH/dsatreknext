import React from 'react';
import styled from 'styled-components';

const SubscribeButton = ({
  onClick,
  className,
  planLabel = 'SUBSCRIBE',
  children,
}) => {
  // Use planLabel if provided, otherwise fallback to children or "SUBSCRIBE"
  const buttonText = planLabel || children || 'SUBSCRIBE';
  return (
    <StyledWrapper className={className} $buttonText={buttonText}>
      <button className="Btn" onClick={onClick}>
        {buttonText}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    width: 100px;
    height: 32px;

    @media (min-width: 1280px) {
      width: 140px;
      height: 40px;
    }
    border: none;
    border-radius: 10px;
    background: linear-gradient(
      to right,
      #b8860b,
      #ffd700,
      #d4af37,
      #b8860b,
      #ffd700,
      #d4af37
    );
    background-size: 250%;
    background-position: left;
    color: #ffd700;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition-duration: 1s;
    overflow: hidden;
    font-weight: 600;
  }

  .Btn::before {
    position: absolute;
    content: '${props => props.$buttonText}';
    color: #ffd277;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 97%;
    height: 90%;
    border-radius: 8px;
    transition-duration: 1s;
    background-color: rgba(0, 0, 0, 0.842);
    background-size: 200%;
    font-weight: 600;
  }

  .Btn:hover {
    background-position: right;
    transition-duration: 1s;
  }

  .Btn:hover::before {
    background-position: right;
    transition-duration: 1s;
  }

  .Btn:active {
    transform: scale(0.95);
  }
`;

export default SubscribeButton;
