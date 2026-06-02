import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyDocumentMeta, resolveRouteMeta } from "../utils/documentMeta";

/** Updates document title and meta description on client-side route changes. */
export default function DocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyDocumentMeta(resolveRouteMeta(pathname));
  }, [pathname]);

  return null;
}
