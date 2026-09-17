"use client";

import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import { property, type PropertyResourceModule } from "./property-data";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

const themeStyle: ThemeStyle = {
  "--paper": property.theme.paper,
  "--ink": property.theme.ink,
  "--accent": property.theme.accent,
  "--soft-accent": property.theme.softAccent,
  "--muted": property.theme.muted,
  "--line": property.theme.line,
};

const sourceImageDimensions = {
  width: 2048,
  height: 1365,
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function NewTabHint() {
  return (
    <>
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}

export default function Home() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [formReviewed, setFormReviewed] = useState(false);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxOpenerRef = useRef<HTMLElement | null>(null);
  const isLightboxOpen = lightbox !== null;
  const resourceModules: Array<PropertyResourceModule | undefined> = [
    property.modules.video,
    property.modules.tour,
    property.modules.floorPlan,
    property.modules.map,
  ];
  const activeResourceModules = resourceModules.filter(
    (module): module is PropertyResourceModule & { url: string } =>
      Boolean(module?.enabled && module.url),
  );

  useEffect(() => {
    if (!isLightboxOpen) return;

    const pageContent = pageContentRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    const previousAriaHidden = pageContent?.getAttribute("aria-hidden") ?? null;
    const pageWasInert = pageContent?.hasAttribute("inert") ?? false;

    pageContent?.setAttribute("aria-hidden", "true");
    pageContent?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      lightboxCloseRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightbox(null);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setLightbox((current) =>
          current === null ? current : (current + 1) % property.gallery.length,
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLightbox((current) =>
          current === null
            ? current
            : (current - 1 + property.gallery.length) % property.gallery.length,
        );
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = lightboxRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;

      if (!pageWasInert) pageContent?.removeAttribute("inert");
      if (previousAriaHidden === null) {
        pageContent?.removeAttribute("aria-hidden");
      } else {
        pageContent?.setAttribute("aria-hidden", previousAriaHidden);
      }

      const opener = lightboxOpenerRef.current;
      if (opener?.isConnected) opener.focus();
    };
  }, [isLightboxOpen]);

  const openLightbox = (index: number, opener: HTMLElement) => {
    lightboxOpenerRef.current = opener;
    setLightbox(index);
  };

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormReviewed(true);
  };

  return (
    <div className="site-root" style={themeStyle}>
      <div className="page-content" ref={pageContentRef}>
        <a className="skip-link" href="#main-content">
          Skip to property details
        </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#top"
          aria-label={property.identity.display.wordmarkAriaLabel}
        >
          <span>{property.identity.display.wordmarkLead}</span>{" "}
          {property.identity.display.wordmarkRest}
        </a>
        <nav aria-label="Primary navigation">
          <a href="#overview">Overview</a>
          <a href="#details">Details</a>
          <a href="#gallery">Gallery</a>
          <a href="#neighborhood">Neighborhood</a>
        </nav>
        <a className="header-cta" href="#contact">
          Inquire <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main-content" tabIndex={-1}>
      <section className="hero" id="top" aria-labelledby="property-title">
        <img
          src={property.hero.src}
          alt={property.hero.alt}
          {...sourceImageDimensions}
          sizes="100vw"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="hero-eyebrow">{property.identity.eyebrow}</p>
          <h1 id="property-title">
            <span>{property.identity.display.heroTitleLead}</span>
            {property.identity.display.heroTitleRest}
          </h1>
          <div className="hero-meta">
            <p>{property.identity.addressLine2}</p>
            <p className="media-note">{property.hero.caption}</p>
          </div>
        </div>
        <a className="scroll-cue" href="#overview" aria-label="Scroll to overview">
          <span>Discover</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="intro" id="overview">
        <div className="section-label reveal-line">
          <span>Property overview</span>
          <span className="draft-pill">
            {property.identity.status} · {property.identity.mls}
          </span>
        </div>
        <div className="address-price">
          <h2>
            {property.identity.addressLine1}
            <span>{property.identity.addressLine2}</span>
          </h2>
          <div>
            <p className="micro-label">Offered at</p>
            <p className="price">{property.price}</p>
          </div>
        </div>
        <dl className="facts-grid">
          {property.facts.map((fact) => (
            <div className="fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="narrative section-shell" id="details">
        <div>
          <p className="section-kicker">{property.narrative.kicker}</p>
          <h2>{property.narrative.heading}</h2>
        </div>
        <div className="narrative-copy">
          {property.narrative.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="verify-note">
            Listing details checked {property.identity.verifiedOn} · Subject to change
          </p>
        </div>
      </section>

      <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="section-shell gallery-heading">
          <div>
            <p className="section-kicker">{property.galleryContent.kicker}</p>
            <h2 id="gallery-title">{property.galleryContent.heading}</h2>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={(event) => openLightbox(0, event.currentTarget)}
          >
            {property.galleryContent.viewAllLabel} <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="gallery-grid">
          {property.gallery.slice(0, 6).map((image, index) => (
            <button
              className={`gallery-item gallery-item-${index + 1}`}
              key={image.src}
              type="button"
              onClick={(event) => openLightbox(index, event.currentTarget)}
              aria-label={`Open image ${index + 1}: ${image.caption}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                {...sourceImageDimensions}
                sizes="(max-width: 560px) 83vw, (max-width: 840px) 50vw, 58vw"
                loading="lazy"
                decoding="async"
              />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <p className="gallery-disclaimer section-shell">
          {property.galleryContent.mediaDisclosure}
        </p>
      </section>

      <section className="features section-shell" aria-labelledby="features-title">
        <div className="features-intro">
          <p className="section-kicker">{property.featuresContent.kicker}</p>
          <h2 id="features-title">{property.featuresContent.heading}</h2>
        </div>
        <div className="feature-list">
          {property.features.map((feature) => (
            <article className="feature" key={feature.number}>
              <div className="feature-image">
                <img
                  src={feature.image.src}
                  alt={feature.image.alt}
                  {...sourceImageDimensions}
                  sizes="(max-width: 840px) calc(100vw - 40px), 66vw"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="feature-copy">
                <span>{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <small>{property.featuresContent.itemLabel}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="neighborhood section-shell" id="neighborhood" aria-labelledby="neighborhood-title">
        <div className="neighborhood-intro">
          <div>
            <p className="section-kicker">{property.neighborhood.kicker}</p>
            <h2 id="neighborhood-title">{property.neighborhood.heading}</h2>
          </div>
          <p>{property.neighborhood.introduction}</p>
        </div>
        <div className="neighborhood-grid">
          {property.neighborhood.highlights.map((highlight, index) => (
            <a
              href={highlight.url}
              target="_blank"
              rel="noopener noreferrer"
              key={highlight.title}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{highlight.title}</h3>
              <p>{highlight.body}</p>
              <small>
                {property.neighborhood.sourceLinkLabel}
                <NewTabHint />
              </small>
            </a>
          ))}
        </div>
        <p className="school-note">{property.neighborhood.schoolNote}</p>
      </section>

      <section className="pull-quote" aria-label="Property introduction">
        <blockquote>
          <p>“{property.pullQuote.text}”</p>
          <cite>{property.pullQuote.attribution}</cite>
        </blockquote>
      </section>

      {activeResourceModules.length > 0 && (
        <section className="resources section-shell" aria-labelledby="resources-title">
          <div className="resources-heading">
            <p className="section-kicker">{property.resources.kicker}</p>
            <h2 id="resources-title">{property.resources.heading}</h2>
          </div>
          <div className="resource-grid">
            {activeResourceModules.map((module, index) => (
              <article key={module.title}>
                <span className="module-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{module.title}</h3>
                  <p>{module.body}</p>
                </div>
                <a
                  className="pending available"
                  href={module.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {module.actionLabel}
                  <NewTabHint />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="agent-card">
          <div className="agent-monogram" aria-hidden="true">{property.agent.initials}</div>
          <div>
            <p className="section-kicker">{property.contact.agentKicker}</p>
            <h2>
              {property.agent.profileUrl ? (
                <a
                  href={property.agent.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {property.agent.name}
                  <NewTabHint />
                </a>
              ) : property.agent.name}
            </h2>
            <p>{property.agent.role} · {property.agent.brokerage}</p>
            <p>{property.agent.license}</p>
            <div className="agent-links">
              <a href={`tel:${property.agent.phone.replace(/\D/g, "")}`}>{property.agent.phone}</a>
              <a href={`mailto:${property.agent.email}`}>{property.agent.email}</a>
            </div>
            {property.agent.secondary && (
              <div className="co-agent">
                <span>{property.contact.secondaryAgentLabel}</span>
                {property.agent.secondary.profileUrl ? (
                  <a
                    href={property.agent.secondary.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {property.agent.secondary.name}
                    <NewTabHint />
                  </a>
                ) : (
                  <strong>{property.agent.secondary.name}</strong>
                )}
                <p>{property.agent.secondary.license}</p>
                <a href={`tel:${property.agent.secondary.phone.replace(/\D/g, "")}`}>
                  {property.agent.secondary.phone}
                </a>
                <a href={`mailto:${property.agent.secondary.email}`}>
                  {property.agent.secondary.email}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="lead-panel">
          <p className="section-kicker">{property.contact.inquiryKicker}</p>
          <h2 id="contact-title">{property.contact.heading}</h2>
          <p>{property.contact.introduction}</p>
          <form onSubmit={submitLead} onInput={() => setFormReviewed(false)}>
            <div className="form-row">
              <label>
                <span>{property.contact.fields.name}</span>
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                <span>{property.contact.fields.email}</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </div>
            <label>
              <span>{property.contact.fields.phone} <small>{property.contact.fields.optional}</small></span>
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              <span>{property.contact.fields.message}</span>
              <textarea name="message" rows={3} defaultValue={property.contact.defaultMessage} />
            </label>
            <button type="submit">{property.contact.submitLabel} <span aria-hidden="true">↗</span></button>
            <p className="form-status" aria-live="polite">
              {formReviewed ? property.contact.sentStatus : property.contact.idleStatus}
            </p>
          </form>
        </div>
      </section>

      </main>

      <footer>
        <a
          className="wordmark footer-mark"
          href="#top"
          aria-label={property.identity.display.wordmarkAriaLabel}
        >
          <span>{property.identity.display.wordmarkLead}</span>{" "}
          {property.identity.display.wordmarkRest}
        </a>
        <p>{property.disclosure}</p>
        <nav className="footer-sources" aria-label={property.footer.sourcesAriaLabel}>
          <ul>
            {property.sources.map((source) => (
              <li key={source.label}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}
                  <NewTabHint />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-bottom">
          <span>{property.footer.verificationLabel} {property.identity.verifiedOn}</span>
          <span>{property.footer.photographyLabel}</span>
        </div>
      </footer>

      <a className="mobile-cta" href="#contact">{property.contact.mobileCtaLabel}</a>
      </div>

      {lightbox !== null && (
        <div
          className="lightbox"
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Property gallery"
          aria-describedby="lightbox-caption"
          tabIndex={-1}
        >
          <button
            className="lightbox-close"
            ref={lightboxCloseRef}
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close gallery"
          >
            ×
          </button>
          <button
            className="lightbox-prev"
            type="button"
            onClick={() => setLightbox((lightbox - 1 + property.gallery.length) % property.gallery.length)}
            aria-label="Previous image"
          >
            ←
          </button>
          <figure>
            <img
              src={property.gallery[lightbox].src}
              alt={property.gallery[lightbox].alt}
              {...sourceImageDimensions}
              sizes="(max-width: 840px) calc(100vw - 88px), 80vw"
              decoding="async"
            />
            <figcaption id="lightbox-caption" aria-live="polite" aria-atomic="true">
              <span>{property.gallery[lightbox].caption}</span>
              <span>{lightbox + 1} / {property.gallery.length}</span>
            </figcaption>
          </figure>
          <button
            className="lightbox-next"
            type="button"
            onClick={() => setLightbox((lightbox + 1) % property.gallery.length)}
            aria-label="Next image"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
