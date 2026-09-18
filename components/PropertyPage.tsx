import Image from "next/image";
import type { CSSProperties } from "react";
import type { PageModel, PropertyPhoto } from "@/lib/site-content";
import { Gallery } from "./Gallery";
import { InquiryForm } from "./InquiryForm";
import { inquiryCaptureEnabled } from "@/lib/inquiry-config";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function photoRatioStyle(photo: PropertyPhoto): CSSProperties & { "--photo-ratio": string } {
  return { "--photo-ratio": `${photo.width} / ${photo.height}` };
}

export function PropertyPage({ page }: Readonly<{ page: PageModel }>) {
  const { property } = page;
  const cityLine = `${property.identity.locality}, ${property.identity.region} ${property.identity.postalCode}`;
  const heroPosition = property.hero.desktopFocus
    ? `${property.hero.desktopFocus.x * 100}% ${property.hero.desktopFocus.y * 100}%`
    : "50% 50%";
  const heroStyle = photoRatioStyle(property.hero);
  const factSummary = property.facts
    .slice(0, 3)
    .map((fact) => `${fact.value} ${fact.label.toLowerCase()}`)
    .join(" · ");
  const inquiryDeliveryEnabled = inquiryCaptureEnabled();
  const themeStyle: CSSProperties & Record<`--${string}`, string> = {
    "--paper": property.theme.paper,
    "--ink": property.theme.ink,
    "--accent": property.theme.accent,
    "--soft-accent": property.theme.soft,
  };

  return (
    <div className="site-root" data-audience={page.kind} style={themeStyle}>
      <a className="skip-link" href="#overview">Skip to property overview</a>
      <header className="site-header">
        <a className="wordmark" href="#top">
          <span>{property.identity.street.split(" ")[0]}</span>
          {property.identity.street.split(" ").slice(1, -1).join(" ")}
        </a>
        <nav aria-label="Primary navigation">
          <a href="#overview">Overview</a>
          <a href="#details">Details</a>
          <a href="#gallery">Gallery</a>
          <a href="#neighborhood">Neighborhood</a>
          {page.kind === "branded" && page.brand.recentListings.length > 0 ? <a href="#listings">Listings</a> : null}
        </nav>
        {page.kind === "branded" ? <a className="header-cta" href="#contact">Inquire</a> : <a className="mls-mark" href="#overview">Property details</a>}
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-media" style={heroStyle}>
            <Image
              src={property.hero.src}
              alt={property.hero.alt}
              fill
              priority
              sizes="100vw"
              style={{ objectPosition: heroPosition }}
            />
            <div className="hero-shade" aria-hidden="true" />
          </div>
          <div className="hero-copy">
            <p className="hero-eyebrow">Former model home in Stoneridge Place</p>
            <h1><span>{property.identity.street.split(" ")[0]}</span>{property.identity.street.split(" ").slice(1).join(" ")}</h1>
            <div className="hero-meta">
              <p>{cityLine}</p>
              <p>{factSummary}</p>
            </div>
          </div>
        </section>

        <section className="intro" id="overview" tabIndex={-1}>
          <div className="section-label">
            <span>Property overview</span>
            <span className="status-pill">{property.identity.status} · {property.identity.mls}</span>
          </div>
          <div className="address-price">
            <h2>{property.identity.street}<span>{cityLine}</span></h2>
            <div><p className="micro-label">Offered at</p><p className="price">{property.price}</p></div>
          </div>
          <dl className="facts-grid" aria-label="Property facts">
            {property.facts.map((fact) => (
              <div className="fact" key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
        </section>

        <section className="narrative section-shell" id="details">
          <div>
            <p>The residence</p>
            <h2>{property.headline}</h2>
          </div>
          <div className="narrative-copy">
            <p>{property.introduction}</p>
          </div>
        </section>

        <section id="gallery" className="gallery-section">
          <div className="gallery-heading section-shell"><div><p className="section-kicker">Property gallery</p><h2>See the property room by room.</h2></div></div>
          <Gallery photos={property.gallery} />
        </section>

        <section className="features section-shell">
          <div className="features-intro"><p className="section-kicker">Property highlights</p><h2>Living spaces, kitchen, and outdoor areas.</h2></div>
          <div className="feature-list">
            {property.sections.map((section, index) => (
              <article className="feature" key={section.title}>
                {section.photo ? (
                  <div className="feature-image" style={photoRatioStyle(section.photo)}>
                    <Image src={section.photo.src} alt={section.photo.alt} fill sizes="(max-width: 840px) calc(100vw - 40px), 66vw" />
                  </div>
                ) : null}
                <div className="feature-copy"><span>{String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="neighborhood section-shell" id="neighborhood">
          <div className="neighborhood-intro"><div><p className="section-kicker">Around Stoneridge Place</p><h2>{property.neighborhood.title}</h2></div><p>{property.neighborhood.introduction}</p></div>
          {property.neighborhood.highlights.length > 0 ? (
            <div className="neighborhood-grid">
              {property.neighborhood.highlights.map((highlight, index) => (
                <a href={highlight.url} target="_blank" rel="noreferrer" key={highlight.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span><h3>{highlight.title}</h3><p>{highlight.body}</p><small>Learn about {highlight.title}</small>
                </a>
              ))}
            </div>
          ) : null}
          <p className="school-note">School boundaries, capacity, overflow placement, and enrollment can change. Verify directly with Pleasanton Unified.</p>
        </section>

        {page.kind === "branded" && page.brand.recentListings.length > 0 ? (
          <section className="recent-listings section-shell" id="listings">
            <div className="recent-listings-heading">
              <p className="section-kicker">Selected listings</p>
              <h2>Current and recent homes.</h2>
            </div>
            <div className="recent-listings-grid">
              {page.brand.recentListings.map((listing) => (
                <article className="recent-listing-card" key={listing.street}>
                  <a href={listing.url} target="_blank" rel="noreferrer" aria-label={`View ${listing.street}`}>
                    <div className="recent-listing-image" style={{ "--photo-ratio": `${listing.image.width} / ${listing.image.height}` } as CSSProperties}>
                      <Image
                        src={listing.image.src}
                        alt={listing.image.alt}
                        fill
                        sizes="(max-width: 840px) 82vw, 25vw"
                      />
                    </div>
                    <div className="recent-listing-copy">
                      <div className="recent-listing-summary">
                        <span>{listing.status}</span>
                        <strong>{listing.price}</strong>
                      </div>
                      <p>{listing.beds} bd · {listing.baths} ba · {listing.interior}</p>
                      <h3>{listing.street}</h3>
                      <p>{listing.locality}</p>
                      <span className="recent-listing-link">View listing</span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {page.kind === "branded" ? (
          <section className="contact" id="contact">
            <div className="agent-card">
              <div className="agent-team-heading">
                <p className="section-kicker">Your listing advisors</p>
                <h2>Meet the team</h2>
              </div>
              <div className="agents">
                {page.brand.agents.map((agent) => (
                  <article className="agent-profile" key={agent.email}>
                    {agent.headshot ? (
                      <div className="agent-portrait agent-headshot">
                        <Image src={agent.headshot.src} alt={agent.headshot.alt} fill sizes="132px" loading="eager" />
                      </div>
                    ) : (
                      <div className="agent-portrait agent-monogram" aria-hidden="true">{agent.initials}</div>
                    )}
                    <div className="agent-profile-copy">
                      <h3>{agent.name}</h3><p>{agent.role}</p><p>{agent.license}</p>
                      <a href={phoneHref(agent.phone)}>{agent.phone}</a>
                      <a href={`mailto:${agent.email}`}>{agent.email}</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="lead-panel">
              <p className="section-kicker">Private inquiry</p>
              <h2>{page.inquiry.heading}</h2>
              <p>{page.inquiry.introduction}</p>
              {inquiryDeliveryEnabled ? (
                <InquiryForm inquiry={page.inquiry} propertyId={property.id} />
              ) : (
                <div className="direct-inquiry">
                  <p>For the fastest response, contact the listing team directly.</p>
                  {page.brand.agents.map((agent) => (
                    <div key={agent.email}>
                      <strong>{agent.name}</strong>
                      <a href={phoneHref(agent.phone)}>Call {agent.phone}</a>
                      <a href={`mailto:${agent.email}?subject=${encodeURIComponent(property.identity.street)}`}>Email {agent.name.split(" ")[0]}</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
        <a className="wordmark footer-mark" href="#top"><span>{property.identity.street.split(" ")[0]}</span>{property.identity.street.split(" ").slice(1, -1).join(" ")}</a>
        <p>{page.disclosure}</p>
        {page.kind === "branded" ? <div className="brokerage-mark"><strong>{page.brand.brokerageName}</strong><span>{page.brand.agents.map((agent) => agent.name).join(" and ")}</span></div> : null}
        <div className="footer-bottom">
          {page.kind === "branded" ? (
            <><span>Presented by {page.brand.agents.map((agent) => agent.name).join(" and ")}</span><span>{page.brand.agents.map((agent) => agent.license).join(" · ")}</span></>
          ) : (
            <><span>{property.identity.street}</span><span>{cityLine}</span></>
          )}
        </div>
      </footer>
    </div>
  );
}
