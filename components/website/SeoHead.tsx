
import React, { useEffect } from 'react';

interface SeoHeadProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    structuredData?: object;
}

const SeoHead: React.FC<SeoHeadProps> = ({ title, description, canonicalUrl, structuredData }) => {
    useEffect(() => {
        // Update Title
        document.title = `${title} | DWI Education of Central Texas`;

        // Update Meta Description
        let metaDescription = document.querySelector("meta[name='description']");
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Update Open Graph Tags
        const updateMeta = (property: string, content: string) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        updateMeta('og:title', title);
        updateMeta('og:description', description);
        updateMeta('og:type', 'website');
        
        // Canonical URL
        if (canonicalUrl) {
             let link = document.querySelector("link[rel='canonical']");
             if (!link) {
                 link = document.createElement('link');
                 link.setAttribute('rel', 'canonical');
                 document.head.appendChild(link);
             }
             link.setAttribute('href', canonicalUrl);
        }

        // Structured Data (JSON-LD)
        if (structuredData) {
            let script = document.querySelector("script[type='application/ld+json']");
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(structuredData);
        } else {
            // Clean up structured data if not present on this page
            const script = document.querySelector("script[type='application/ld+json']");
            if (script) {
                script.remove();
            }
        }

    }, [title, description, canonicalUrl, structuredData]);

    return null;
};

export default SeoHead;
