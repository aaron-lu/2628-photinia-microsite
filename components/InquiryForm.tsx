"use client";

import { useRef, useState, type FormEvent } from "react";
import type { BrandedPageModel } from "@/lib/site-content";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; receiptId: string }
  | { kind: "error"; message: string };

export function InquiryForm({ inquiry, propertyId }: Readonly<{ inquiry: BrandedPageModel["inquiry"]; propertyId: string }>) {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);
  const lastPayload = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fingerprint = JSON.stringify(["name", "email", "phone", "message", "consent"].map((key) => formData.get(key)));
    if (lastPayload.current !== fingerprint) submissionId.current = null;
    lastPayload.current = fingerprint;
    submissionId.current ??= crypto.randomUUID();
    submitting.current = true;
    setState({ kind: "submitting" });
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json", "x-requested-with": "fetch" },
        body: JSON.stringify({
          propertyId,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
          submissionId: submissionId.current,
          website: formData.get("website"),
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (response.ok && typeof payload === "object" && payload !== null && "receiptId" in payload && typeof payload.receiptId === "string") {
        setState({ kind: "success", receiptId: payload.receiptId });
        submissionId.current = null;
        form.reset();
        return;
      }
    } catch {
      // The actionable fallback is shown below for network and server failures.
    } finally {
      submitting.current = false;
    }
    setState({ kind: "error", message: "Your inquiry was not delivered. Please contact the listing team directly." });
  }

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="form-row">
        <label><span>Name</span><input name="name" autoComplete="name" required minLength={2} /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <label><span>Phone <small>Optional</small></span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label><span>Message</span><textarea name="message" required defaultValue={inquiry.defaultMessage} rows={3} /></label>
      <label className="consent"><input name="consent" type="checkbox" required /><span>{inquiry.consentText} <a href={inquiry.privacyUrl}>Privacy policy</a></span></label>
      <button type="submit" disabled={state.kind === "submitting"}>{state.kind === "submitting" ? "Sending" : "Send inquiry"}</button>
      <p className="form-status" aria-live="polite">
        {state.kind === "success" ? `Inquiry received. Confirmation ${state.receiptId}.` : null}
        {state.kind === "error" ? state.message : null}
      </p>
    </form>
  );
}
