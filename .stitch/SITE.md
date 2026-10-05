# Project Vision & Constitution: FixMyCampus

> **AGENT INSTRUCTION:** Read this file before every iteration. It serves as the project's "Long-Term Memory."

## 1. Core Identity
* **Project Name:** FixMyCampus
* **Stitch Project ID:** 
* **Mission:** Empower university students and staff to easily report, track, and resolve campus maintenance and facility issues.
* **Target Audience:** College students, facility managers, campus administrators, maintenance staff.
* **Voice:** Professional, accessible, reliable, modern, and proactive.

## 2. Visual Language
*Reference these descriptors when prompting Stitch.*

* **The "Vibe" (Adjectives):**
    * *Primary:* Clean & modern civic-tech
    * *Secondary:* Friendly & trustworthy
    * *Tertiary:* High-efficiency utility dashboard

## 3. Architecture & File Structure
* **Root:** `site/public/` or `src/app/`
* **Asset Flow:** Stitch generates to `.stitch/designs/` → Validate → Integrate into app
* **Navigation Strategy:** Global sidebar or top navigation bar with persistent status indicators

## 4. Live Sitemap (Current State)
*Update this when a new page is successfully generated and merged.*

* [ ] `dashboard.html` - Overview of campus issues, live status metrics, and recent reports
* [ ] `report-issue.html` - Multi-step interactive incident reporting form with photo upload and location picker
* [ ] `issue-details.html` - Detailed issue view with timeline, status updates, and comments
* [ ] `admin-management.html` - Staff triage table, assignment controls, and resolution workflows
* [ ] `profile.html` - User profile, notification preferences, and submitted ticket history

## 5. The Roadmap (Backlog)
*Pick the next task from here if available.*

### High Priority
- [ ] Student issue reporting workflow (`report-issue`)
- [ ] Central campus maintenance dashboard (`dashboard`)
- [ ] Ticket detail with resolution timeline (`issue-details`)

### Medium Priority
- [ ] Admin management & dispatch console (`admin-management`)
- [ ] Campus interactive map view with issue pins (`campus-map`)

## 6. Creative Freedom Guidelines
1. **Stay On-Brand:** Maintain consistent university civic-tech aesthetic.
2. **Accessible First:** High contrast ratios, clear form labels, mobile-responsive layout.
3. **Naming Convention:** Use lowercase kebab-case filenames (e.g. `report-issue.html`).

### Ideas to Explore
- [ ] `campus-map.html` - Interactive map with heatmaps of reported issues
- [ ] `notifications.html` - Activity feed of status changes on reported tickets
- [ ] `analytics.html` - Campus maintenance SLA and resolution rate analytics

## 7. Rules of Engagement
1. Do not recreate pages already marked as done in Section 4.
2. Always update `.stitch/next-prompt.md` before completing an iteration to continue the loop.
3. Remove consumed items from Section 5/6 once built.
