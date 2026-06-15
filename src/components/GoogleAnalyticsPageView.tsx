import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  initGoogleAnalytics,
  trackGoogleAnalyticsPageView,
} from "../lib/googleAnalytics";

export default function GoogleAnalyticsPageView() {
  const location = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    trackGoogleAnalyticsPageView(pagePath);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
