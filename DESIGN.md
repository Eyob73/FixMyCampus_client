---
name: Campus Operations & Facilities Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  stat-numeric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.25rem
  space-xs: 0.375rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system serves higher education facilities teams, campus administrators, staff, and students tracking physical plant operations. The aesthetic is utilitarian, authoritative, and frictionless—anchored in the visual clarity of institutional enterprise tools.

### Design Movement
**Corporate / Modern Civic Utility:** Crisp geometry, authentic white surfaces over cool tinted backgrounds, purposeful information hierarchy, and zero decorative fluff. Avoid gradients, frosted glass reflections, skeumorphism, or high-friction animations. The UI must prioritize immediate situational awareness, scan speed, and high legibility across dense data tables, operational queues, and status trackers.

## Colors

The color system uses a deliberate division between neutral canvas scaffolding, primary brand structure, and semantic ticket operational states.

### Core Canvas & Structure
- **App Canvas Background:** `#F8FAFC` (Slate-50) for outer frame; `#F1F5F9` (Slate-100) for nested workspace panels.
- **Card & Surface Background:** `#FFFFFF` (Pure White).
- **Subtle Surface Border:** `#E2E8F0` (Slate-200) for card borders and structural dividers.
- **Subtle Interactive Border:** `#CBD5E1` (Slate-300) for inactive inputs, table headers, and hover outlines.
- **Primary Brand / Institutional Slate:** `#1E3A8A` (Deep University Navy) used for the persistent sidebar background, critical actions, and key brand marks. Primary action active/focus state transitions to `#1D4ED8` or `#2563EB`.

### Semantic Lifecycle Status Tokens
Every status badge and pipeline indicator follows an explicit, immutable pairing of 10% tinted surface fill, 1-pixel solid boundary border, and high-contrast solid label text:
- **New / Unassigned:** 
  - Text & Icon: `#4F46E5` (Indigo-600)
  - Surface Fill: `#EEF2FF` (Indigo-50)
  - Border: `#C7D2FE` (Indigo-200)
- **Assigned / Queued:** 
  - Text & Icon: `#D97706` (Amber-600)
  - Surface Fill: `#FFFBEB` (Amber-50)
  - Border: `#FDE68A` (Amber-200)
- **In Progress / Active Repair:** 
  - Text & Icon: `#0284C7` (Sky-600)
  - Surface Fill: `#F0F9FF` (Sky-50)
  - Border: `#BAE6FD` (Sky-200)
- **Resolved / Closed:** 
  - Text & Icon: `#10B981` (Emerald-600)
  - Surface Fill: `#ECFDF5` (Emerald-50)
  - Border: `#A7F3D0` (Emerald-200)
- **Critical / Urgent Escalation:**
  - Text & Icon: `#DC2626` (Red-600)
  - Surface Fill: `#FEF2F2` (Red-50)
  - Border: `#FECACA` (Red-200)

### Typography Neutrals
- **Primary Headings & Key Data:** `#0F172A` (Slate-900)
- **Body & Table Data:** `#334155` (Slate-700)
- **Secondary Details & Metadata:** `#64748B` (Slate-500)
- **Muted Placeholders & Disabled:** `#94A3B8` (Slate-400)

## Typography

Typography relies on `Inter` across all functional roles to provide systematic optical legibility in high-density maintenance queues and administrative dashboards.

### Type Hierarchy Rules
- **Numerical Stats:** Metric stat cards utilize `stat-numeric` (`28px`, bold, tabular figures enabled: `font-feature-settings: 'tnum' on, 'cv05' on`).
- **Table Headers & Meta Labels:** Use `label-md` uppercase styling with tight spacing for compact table column identifiers.
- **Ticket Titles:** Standardized to `title-md` (`15px`, 600 weight) to allow scannability without overwhelming the row density.
- **Audit Logs & Timelines:** Body text defaults to `body-sm` (`13px`) with timestamps displayed in `label-sm` slate-500.

## Layout & Spacing

The layout is built around a persistent two-dimensional operational frame:
1. **Vertical Rail (Sidebar):** Fixed `256px` wide on desktop (`lg` breakpoint ≥ 1024px), collapsible to an icon-only `64px` rail or slide-over drawer on mobile/tablet.
2. **Top Administrative Header:** Persistent `64px` tall utility header spanning the content area, housing global search, quick-create buttons, and profile actions.
3. **Workspace Canvas:** Uses fluid width with a maximum container threshold of `1600px` to maintain comfortable readability in wide monitors.

### Spacing System
- **Metric Cards Grid:** Arranged in 4-column desktop grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) separated by `1.5rem` (`space-xl`) gutters.
- **Card Interior Padding:** `1.25rem` to `1.5rem` (`space-xl`) on standard cards; compact data list items use `0.75rem` (`space-md`) vertical padding.
- **Form Controls:** Compact layout rhythm using `space-xs` (6px) between form labels and inputs, and `space-lg` (16px) between adjacent field stacks.

## Elevation & Depth

Visual hierarchy uses crisp 1px borders paired with ultra-diffused, single-stop ambient shadows. Avoid multi-layered heavy drop shadows or dramatic blurs.

### Elevation Levels
- **Level 0 (Flat Canvas):** Surface color `#F8FAFC`, no shadow, no border. Used for the viewport background.
- **Level 1 (Card & Content Blocks):** Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 1px 2px 0 rgba(15, 23, 42, 0.04)`. Used for all standard cards, metric panels, and table wrappers.
- **Level 2 (Hover & Active Elements):** Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`. Used for clickable tickets, interactive cards on hover, and active filter popovers.
- **Level 3 (Overlays & Dialogs):** Surface `#FFFFFF`, border `1px solid #E2E8F0`, shadow `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Used for modals, action sheets, and dropdown menus.

## Shapes

The design uses **Soft (Level 1)** structural rounding to reinforce an orderly, clean institutional software aesthetic.

### Radius Assignments
- **Input Fields, Table Headers, Small Buttons:** `rounded` (4px / `0.25rem`) for compact precision.
- **Cards, Filter Bars, Modal Shells:** `rounded-lg` (8px / `0.5rem`) for perimeter enclosures.
- **Status Badges & Category Chips:** Fully pill-shaped (`rounded-full` / `9999px`) to create an immediate visual contrast against square data cards and tabular grids.

## Components

### Action Buttons
- **Primary:** Background `#1E3A8A`, text `#FFFFFF`, border none, hover `#1D4ED8`, focus ring `2px solid #2563EB` with `2px` offset. Height `38px` (desktop), padding `0 16px`, font `label-lg`.
- **Secondary / Outline:** Background `#FFFFFF`, text `#334155`, border `1px solid #CBD5E1`, hover background `#F8FAFC` and border `#94A3B8`.
- **Destructive:** Background `#FFFFFF`, text `#DC2626`, border `1px solid #FCA5A5`, hover background `#FEF2F2`.

### Status Badges (Pills)
- Rendered with `padding: 2px 10px`, `border-radius: 9999px`, font `label-sm` (`11px`, 600 weight), text uppercase with `letter-spacing: 0.04em`.
- Each status badge must incorporate a `6px` solid concentric circle indicator dot on the left of the text label matching the border color.

### Metric Stat Cards
- Container: Pure white card `#FFFFFF`, border `1px solid #E2E8F0`, radius `8px`, padding `16px 20px`.
- Structure: Top row features the metric title (`label-md`, `#64748B`) and a square `36x36px` icon badge with `10%` primary/secondary tint background.
- Bottom row displays the large tabular metric (`stat-numeric`, `#0F172A`) paired with a micro trend indicator badge (+4% this week).

### Filter Bar
- Horizontal toolbar docked directly above data tables.
- Composed of:
  - Search input with inline search icon (`#94A3B8`), width `280px`.
  - Native custom select dropdowns for "Building / Zone", "Priority", "Status", and "Assignee".
  - Clear Filters text button (muted, slate-500) that toggles visible when filters are dirty.

### Ticket Table & Row List
- **Header:** Background `#F8FAFC`, bottom border `1px solid #E2E8F0`, column labels in `label-md` slate-500.
- **Row:** Height `56px`, background `#FFFFFF`, bottom border `1px solid #F1F5F9`, hover background `#F8FAFC`.
- **Columns:** 
  1. Priority bar indicator (left 3px solid strip).
  2. Ticket ID & Title (two-line stack: `#0F172A` bold above `#64748B` location string).
  3. Category chip.
  4. Assigned Staff avatar + text.
  5. Status Badge pill.
  6. Elapsed time / Last updated.

### Linear Workflow Timeline
- Vertical step rail for maintenance progression (Reported → Assessed → Assigned → Repaired → Inspected & Closed).
- Connector: `2px` solid line `#E2E8F0` linking steps. Active steps turn the line to `#1E3A8A`.
- Nodes: `24x24px` circles. Completed steps are solid `#1E3A8A` with a white check icon; current active step is white with a `3px` solid `#0284C7` ring; future steps are solid `#F1F5F9` with a `#CBD5E1` border.

### Input & Select Controls
- Height: `38px`.
- Background: `#FFFFFF`.
- Border: `1px solid #CBD5E1`, border-radius: `4px`.
- Focus State: Border color `#1E3A8A`, subtle outer ring `0 0 0 3px rgba(30, 58, 138, 0.12)`.
- Label: Positioned above input, font `label-md`, color `#334155`, margin-bottom `4px`.
