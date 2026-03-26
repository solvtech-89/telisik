import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { recordView, getStats, getShareTokenFromURL } from '../utils/tracking';

export const useArticleTracking = (contentType, objectId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!contentType || !objectId) {
      setLoading(true);
      return;
    }

    const trackView = async () => {
      try {
        const shareToken = getShareTokenFromURL();

        await recordView(contentType, objectId, shareToken);

        const statsData = await getStats(contentType, objectId);
        setStats(statsData);
      } catch (error) {
        console.error('Error tracking view:', error);
      } finally {
        setLoading(false);
      }
    };

    trackView();
  }, [contentType, objectId, location.pathname]);

  return { stats, loading };
};