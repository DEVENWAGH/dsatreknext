import React from 'react';
import { ChartContainer } from './chart';

/**
 * Safe Chart wrapper that prevents undefined width/height errors in SVG elements
 */
export const SafeChartContainer = ({
  children,
  config,
  className,
  ...props
}) => {
  // Ensure config has safe defaults
  const safeConfig = config || {};

  return (
    <ChartContainer config={safeConfig} className={className} {...props}>
      {children}
    </ChartContainer>
  );
};

/**
 * Safe Bar component for charts that prevents undefined width errors
 */
export const SafeBar = ({ width, height, x, y, ...props }) => {
  const safeWidth = typeof width === 'number' && !isNaN(width) ? width : 0;
  const safeHeight = typeof height === 'number' && !isNaN(height) ? height : 0;
  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
  const safeY = typeof y === 'number' && !isNaN(y) ? y : 0;

  return (
    <rect
      x={safeX}
      y={safeY}
      width={safeWidth}
      height={safeHeight}
      {...props}
    />
  );
};

/**
 * Safe wrapper for chart data that ensures numeric values
 */
export const sanitizeChartData = data => {
  if (!Array.isArray(data)) return [];

  return data.map(item => {
    const sanitized = { ...item };

    // Ensure all numeric fields are valid numbers
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (typeof value === 'string' && !isNaN(Number(value))) {
        sanitized[key] = Number(value);
      } else if (typeof value === 'number' && isNaN(value)) {
        sanitized[key] = 0;
      }
    });

    return sanitized;
  });
};

export default SafeChartContainer;
