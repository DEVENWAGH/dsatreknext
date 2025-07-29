import React from 'react';

/**
 * Safe SVG wrapper component that prevents undefined width/height errors
 */
export const SafeSVG = ({
  width = 24,
  height = 24,
  viewBox = '0 0 24 24',
  children,
  className = '',
  ...props
}) => {
  const safeWidth = width || 24;
  const safeHeight = height || 24;

  return (
    <svg
      width={safeWidth}
      height={safeHeight}
      viewBox={viewBox}
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
};

/**
 * Safe Rect component that prevents undefined width/height errors
 */
export const SafeRect = ({ width = 0, height = 0, x = 0, y = 0, ...props }) => {
  const safeWidth = width || 0;
  const safeHeight = height || 0;

  return <rect x={x} y={y} width={safeWidth} height={safeHeight} {...props} />;
};

export default SafeSVG;
