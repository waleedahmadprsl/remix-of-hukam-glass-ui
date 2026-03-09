import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://hukam.pk/logo-poster.jpg";
const BASE_TITLE = "HUKAM";
const BASE_URL = "https://hukam.pk";

export function useSEO({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = "website",
  canonicalUrl,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Premium Online Shopping in Pakistan`;
    const fullUrl = ogUrl ? `${BASE_URL}${ogUrl}` : BASE_URL;
    const fullCanonical = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : fullUrl;

    // Title
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrKey] = selector.replace("meta[", "").replace("]", "").split("=");
        el.setAttribute(attrKey.trim(), attr);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    if (description) {
      setMeta('meta[name="description"]', "description", description);
      setMeta('meta[property="og:description"]', "property", description);
      setMeta('meta[name="twitter:description"]', "name", description);
    }
    if (keywords) {
      setMeta('meta[name="keywords"]', "name", keywords);
    }

    setMeta('meta[property="og:title"]', "property", fullTitle);
    setMeta('meta[property="og:url"]', "property", fullUrl);
    setMeta('meta[property="og:type"]', "property", ogType);
    setMeta('meta[property="og:image"]', "property", ogImage);
    setMeta('meta[name="twitter:title"]', "name", fullTitle);
    setMeta('meta[name="twitter:url"]', "name", fullUrl);
    setMeta('meta[name="twitter:image"]', "name", ogImage);
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");

    if (noIndex) {
      setMeta('meta[name="robots"]', "name", "noindex, nofollow");
    } else {
      setMeta('meta[name="robots"]', "name", "index, follow");
    }

    // Canonical
    setLink("canonical", fullCanonical);

    return () => {
      document.title = `${BASE_TITLE} | Premium Online Shopping in Pakistan`;
    };
  }, [title, description, keywords, ogImage, ogUrl, ogType, canonicalUrl, noIndex]);
}
