# Editing a listing

`listing.json` is the single source of truth for both the branded site and `/mls`. A content change should never be made separately in a React component.

## Safe workflow

1. Create a branch for the requested edit.
2. Edit only the relevant values in `listing.json`. Keep every property claim tied to an approved source.
3. Do not place brokerage names, agent details, phone numbers, email addresses, contact capture, or branded links in property fields shared with `/mls`.
4. Run `npm run check` and `npm run e2e`.
5. Review both `/` and `/mls` on desktop and mobile.
6. Merge through a pull request so the edit has an approver and an audit trail.

## What agents can change safely

- Price, status, MLS number, facts, and verification date after an MLS refresh
- Headline, introduction, feature copy, and neighborhood copy
- Gallery order and focal points using existing approved photos
- Agent details, disclosure language, colors, and SEO copy

Adding or replacing photos still goes through the factory so file dimensions, references, and mobile behavior are validated automatically.

## Planned visual editor

The factory's next interface should edit this same validated record through a password-protected form, show branded and MLS previews side by side, and create a pull request instead of writing directly to production. Keeping the JSON record as the contract lets that editor be added without rebuilding the sites or creating a second content source.

The recommended approval flow is: realtor submits changes, the editor validates the content, a preview deployment is created from a pull request, and the listing team approves both branded and MLS previews before merge. This gives nontechnical users a simple form while preserving a complete audit trail and rollback path.
