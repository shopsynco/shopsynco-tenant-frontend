import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPixelPageView } from "../lib/metaPixel";

export default function MetaPixelPageView() {
  const location = useLocation();

  useEffect(() => {
    trackMetaPixelPageView();
  }, [location.pathname]);

  return null;
}
