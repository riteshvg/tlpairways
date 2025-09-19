import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analytics';

const withAnalytics = (WrappedComponent, pageName) => {
  return function WithAnalyticsComponent(props) {
    const location = useLocation();

    useEffect(() => {
      // Track page view
      analytics.pageView(pageName, location.state?.previousPage);

      // Clean up function
      return () => {
        // Any cleanup if needed
      };
    }, [location]);

    return <WrappedComponent {...props} />;
  };
};

export default withAnalytics; 