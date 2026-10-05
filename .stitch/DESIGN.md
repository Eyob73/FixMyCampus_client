# Design System: FixMyCampus

## 1. Visual Theme & Atmosphere
Clean, authoritative yet approachable civic utility dashboard. Crisp layouts, clear typography, generous spacing, high contrast, and refined interactive accents.

## 2. Color Palette & Roles
- **Primary Brand / Action:** Indigo Blue (`#3B82F6`)
- **Primary Hover:** Deep Cobalt (`#2563EB`)
- **Background Base:** Pure White / Subtle Cool Tint (`#F8FAFC`)
- **Surface / Card Background:** Pure White (`#FFFFFF`) with subtle border (`#E2E8F0`)
- **Text Primary:** Deep Slate (`#0F172A`)
- **Text Secondary:** Slate Gray (`#64748B`)
- **Success / Resolved:** Emerald (`#10B981`)
- **Warning / In Progress:** Amber (`#F59E0B`)
- **Danger / Critical Priority:** Crimson Rose (`#EF4444`)

## 3. Typography Rules
- **Font Family:** Inter, system-ui, -apple-system, sans-serif
- **Headlines:** Bold / Semi-bold (weights 600, 700), tight letter spacing
- **Body Text:** Regular (weight 400), 16px base, 1.5 line height

## 4. Component Stylings
- **Buttons:** 8px rounded corners (`rounded-lg`), bold medium text, subtle shadow
- **Cards:** 12px rounded corners (`rounded-xl`), 1px subtle border (`border-slate-200`), soft drop shadow
- **Status Badges:** Pill-shaped (`rounded-full`), soft background with darker text (e.g. Amber background with dark amber text)
- **Inputs:** 8px rounded, 1px border, focus ring with primary accent color

## 5. Layout Principles
- Responsive container with 1200px max width
- 16px to 24px standard padding
- Grid layouts for dashboards, single-column stepped forms for workflows

## 6. Design System Notes for Stitch Generation
**Copy this block into every baton prompt:**

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop and Mobile friendly
- Theme: Clean, modern civic-tech light theme
- Background: Very soft cool white (#F8FAFC)
- Surface: White (#FFFFFF) with subtle border (#E2E8F0)
- Primary Accent: Indigo Blue (#3B82F6) with deep cobalt hover (#2563EB)
- Status Colors: Emerald (#10B981) for resolved, Amber (#F59E0B) for in-progress, Crimson (#EF4444) for urgent
- Text Primary: Deep Slate (#0F172A)
- Text Secondary: Slate Muted (#64748B)
- Font: Modern clean sans-serif (Inter)
- Roundness: 8px on buttons/inputs, 12px on cards
- Visual Style: Crisp lines, refined shadows, accessible contrast, informative status badges
