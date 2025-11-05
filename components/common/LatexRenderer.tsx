import React, { useEffect, useRef } from 'react';

// Loads a script or stylesheet only once and returns a Promise that resolves when loaded.
const loadScript = (src: string, isStyle = false) => {
    return new Promise<void>((resolve, reject) => {
        try {
            if (isStyle) {
                if (document.querySelector(`link[href="${src}"]`)) {
                    resolve();
                    return;
                }
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = src;
                link.onload = () => resolve();
                link.onerror = () => reject(new Error(`Failed to load stylesheet ${src}`));
                document.head.appendChild(link);
            } else {
                if (document.querySelector(`script[src="${src}"]`)) {
                    // If already present and loaded, resolve. If present but not loaded, wait onload.
                    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
                    if (existing && (existing as any)._loaded) {
                        resolve();
                    } else if (existing) {
                        existing.addEventListener('load', () => resolve());
                        existing.addEventListener('error', () => reject(new Error(`Failed to load script ${src}`)));
                    }
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    (script as any)._loaded = true;
                    resolve();
                };
                script.onerror = () => reject(new Error(`Failed to load script ${src}`));
                document.head.appendChild(script);
            }
        } catch (err) {
            reject(err);
        }
    });
};

const KATEX_VERSION = '0.16.8';
const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
const KATEX_AUTORENDER = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`;

// A small sanitizer: allow only a small set of tags and strip all attributes to avoid XSS.
const sanitizeHtml = (html: string) => {
    const allowedTags = new Set(['STRONG', 'B', 'EM', 'I', 'BR', 'P', 'SPAN', 'CODE', 'PRE']);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const walk = (node: ChildNode) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            // Remove disallowed tags by replacing them with their textContent
            if (!allowedTags.has(el.tagName)) {
                // unwrap: replace element with its children
                const parent = el.parentNode;
                if (!parent) return;
                while (el.firstChild) parent.insertBefore(el.firstChild, el);
                parent.removeChild(el);
                return;
            }
            // Strip attributes
            for (const attr of Array.from(el.attributes)) {
                el.removeAttribute(attr.name);
            }
        }
        // Recurse into children (snapshot first because we'll mutate)
        const children = Array.from(node.childNodes);
        for (const child of children) walk(child);
    };

    const bodyChildren = Array.from(doc.body.childNodes);
    for (const child of bodyChildren) walk(child);
    return doc.body.innerHTML;
};

const LatexRenderer: React.FC<{ content: string | undefined | null }> = ({ content }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!content || typeof content !== 'string') {
            return;
        }

        let mounted = true;

        const ensureKatexAndRender = async () => {
            const container = containerRef.current;
            if (!container) return;

            try {
                // Load KaTeX CSS and scripts if they're not already loaded
                await loadScript(KATEX_CSS, true);
                await loadScript(KATEX_JS, false);
                await loadScript(KATEX_AUTORENDER, false);

                if (!mounted) return;

                // If content looks like HTML (contains tags), sanitize and set as innerHTML so styling (bold/italic) is preserved.
                const looksLikeHtml = /<[^>]+>/.test(content || '');
                if (looksLikeHtml) {
                    try {
                        const sanitized = sanitizeHtml(content as string);
                        container.innerHTML = sanitized;
                    } catch (err) {
                        // Fallback to textContent if sanitizer fails
                        container.textContent = content;
                    }
                } else {
                    // Plain text: escape via textContent so auto-render can detect math in text nodes
                    container.textContent = content;
                }

                if ((window as any).renderMathInElement) {
                    try {
                        (window as any).renderMathInElement(container, {
                            delimiters: [
                                {left: '$$', right: '$$', display: true},
                                {left: '$', right: '$', display: false}
                            ],
                            throwOnError: false
                        });
                    } catch (error) {
                        console.error('KaTeX rendering error:', error);
                        // Fallback: keep escaped text
                    }
                }
            } catch (err) {
                // If loading KaTeX fails, fall back to plain text rendering
                console.warn('Failed to load KaTeX assets, showing raw text. Error:', err);
                if (mounted && container) container.textContent = content;
            }
        };

        ensureKatexAndRender();

        return () => { mounted = false; };
    }, [content]);

    if (!content) return null;

    return <span ref={containerRef} key={content} />;
};

export default LatexRenderer;