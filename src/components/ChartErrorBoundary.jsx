'use client';

import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <span>Chart data loading...</span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
