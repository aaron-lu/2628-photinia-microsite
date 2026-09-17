"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PropertyPhoto } from "@/lib/site-content";

export function Gallery({ photos }: Readonly<{ photos: readonly PropertyPhoto[] }>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const isOpen = activeIndex !== null;
  const previews = photos.slice(0, 6);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? null : (current + 1) % photos.length);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
        if (!controls || controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [isOpen, photos.length]);

  return (
    <>
      <div className="gallery-grid">
        {previews.map((photo, index) => (
          <button
            className="gallery-item"
            type="button"
            key={photo.id}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            onClick={(event) => { openerRef.current = event.currentTarget; setActiveIndex(index); }}
            aria-label={`${String(index + 1).padStart(2, "0")}. Open image ${index + 1} of ${photos.length}: ${photo.caption}`}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 560px) 83vw, (max-width: 840px) 100vw, 59vw" />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <button className="gallery-all" type="button" onClick={(event) => { openerRef.current = event.currentTarget; setActiveIndex(0); }}>
        View full gallery · {photos.length} photos
      </button>

      {activePhoto && activeIndex !== null ? (
        <div ref={dialogRef} className="lightbox" role="dialog" aria-modal="true" aria-label="Property gallery">
          <button ref={closeRef} className="lightbox-close" type="button" onClick={() => setActiveIndex(null)}>Close</button>
          <div className="lightbox-image">
            <Image src={activePhoto.src} alt={activePhoto.alt} fill sizes="95vw" />
          </div>
          <div className="lightbox-controls">
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + photos.length) % photos.length)}>Previous</button>
            <p aria-live="polite">{activeIndex + 1} of {photos.length} · {activePhoto.caption}</p>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % photos.length)}>Next</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
