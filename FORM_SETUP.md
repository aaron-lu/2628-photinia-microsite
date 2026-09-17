# Inquiry form setup and operations

The branded `/` route can accept buyer inquiries. The `/mls` route never receives the inquiry or agent-contact model and does not render a form.

## Delivery model

Every valid inquiry follows this order:

1. `/api/inquiry` validates the fields, origin, property ID, consent, and request size.
2. Vercel Basic BotID and a hidden honeypot reduce automated submissions.
3. The server writes the complete inquiry to a **private Vercel Blob store**.
4. The visitor receives a success message and receipt ID only after that durable write succeeds.
5. If Resend is configured, the server then sends an email notification with the buyer as the reply-to address.

Blob is the system of record. Resend is only a notification channel. If Resend is unavailable, the lead remains stored and the notification failure is written to the Vercel function logs.

## 1. Connect private lead storage

In the Vercel project:

1. Open **Storage** and create or connect a Blob store.
2. Choose **Private** access.
3. Connect it to the Production environment. Add Preview and Development only if test submissions should use the same store.
4. Confirm that Vercel created `BLOB_READ_WRITE_TOKEN`.
5. Redeploy the project after changing environment variables.

The branded page shows the form only when `BLOB_READ_WRITE_TOKEN` is available. Without it, visitors see direct phone and email links instead of a form that cannot deliver.

Lead records are stored under:

```text
leads/2628-photinia/YYYY-MM-DD/<receipt-id>.json
```

They are private and must not be exposed through a public Blob URL.

## 2. Add optional email alerts with Resend

Use a direct Resend account; a paid Vercel Marketplace integration is not required.

1. Add and verify a sending domain in Resend. Complete the DNS records Resend provides.
2. Create a sending API key for this site.
3. Add these Production environment variables in Vercel:

```text
RESEND_API_KEY=re_...
LEAD_NOTIFICATION_TO=agent@example.com,operations@example.com
LEAD_NOTIFICATION_FROM=2628 Photinia <inquiries@verified-domain.example>
LEAD_NOTIFICATION_SUBJECT=New inquiry for 2628 Photinia Court
```

`LEAD_NOTIFICATION_TO` accepts one or more comma-separated addresses. `LEAD_NOTIFICATION_FROM` must use the domain verified in Resend. Keep all secrets in Vercel; never commit them or paste them into a pull request.

If all three required Resend settings are absent, inquiry storage continues without email. If only some are configured, storage still succeeds but Vercel logs a notification configuration error.

## 3. Production acceptance test

After every storage, notification, domain, or recipient change:

1. Open the production branded route, not `/mls`.
2. Submit a lead named `QA TEST — DELETE` using an inbox the tester controls.
3. Save the receipt ID shown by the form.
4. In the Vercel Blob browser, locate the JSON record whose filename matches that receipt ID.
5. Confirm the stored name, email, phone, message, property ID, consent, and timestamp.
6. When Resend is enabled, confirm the notification reached every intended recipient and that Reply uses the test buyer address.
7. Delete only the clearly marked test record. Never delete a real inquiry during QA.
8. Recheck `/mls`: it must contain no form, phone number, email address, brokerage mark, or agent profile.

A browser success message alone is not proof that the listing team received an alert. Verify both the Blob record and, when enabled, the email notification.

## 4. Local testing

Link the checkout to the correct Vercel project and pull development variables:

```sh
vercel link
vercel env pull .env.local
npm ci
npm run dev
```

`.env.local` is ignored by Git and must remain uncommitted. For automated verification:

```sh
npm run check
npx playwright install chromium webkit
npm run e2e
```

The automated inquiry tests mock external delivery. Production acceptance testing is still required.

## 5. Ownership before launch

Assign and document:

- the person responsible for checking the Blob store when an email alert fails;
- the approved notification recipients and the owner of the verified sending domain;
- who can access stored lead data;
- the retention period for real inquiries;
- the process for locating and deleting a lead by receipt ID; and
- who monitors Vercel function logs and Resend delivery failures.

There is intentionally no automatic deletion policy until the listing team approves a retention window. There is also no retry queue or CRM synchronization; Blob preserves the lead, and an operator must recover from a failed notification.
