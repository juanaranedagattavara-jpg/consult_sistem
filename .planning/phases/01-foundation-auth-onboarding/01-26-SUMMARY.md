---
phase: 01-foundation-auth-onboarding
plan: 26
subsystem: settings-forms
tags: [react, form, appearance, colors, file-upload]
dependency-graph:
  requires: ["01-09", "01-11"]
  provides: ["appearance-form-component"]
  affects: ["01-28"]
tech-stack:
  added: []
  patterns: ["react-hook-form", "useFileUrl", "CSS-variable-theming"]
key-files:
  created:
    - src/components/settings/appearance-form.tsx
  modified: []
decisions:
  - id: appearance-form-1
    decision: "Use useEffect to reset form values when user data loads"
    rationale: "User data loads async from Convex, defaultValues only set on mount"
  - id: appearance-form-2
    decision: "Theme-aware loading state with muted-foreground color"
    rationale: "Consistent with project UX decisions for dark mode"
metrics:
  duration: "~2 minutes"
  completed: "2026-02-04"
---

# Phase 01 Plan 26: Create Appearance Form Summary

Appearance settings form with logo upload, dual color pickers, and live preview for clinic branding customization.

## What Was Built

### AppearanceForm Component (src/components/settings/appearance-form.tsx)

```typescript
export function AppearanceForm() {
  const user = useQuery(api.users.getCurrentUser);
  const updateAppearance = useMutation(api.clinics.updateClinicAppearance);
  const logoUrl = useFileUrl(user?.clinic?.logo);

  // Reset form values when user data loads
  useEffect(() => {
    if (user?.clinic) {
      form.reset({
        logo: user.clinic.logo ? String(user.clinic.logo) : null,
        primaryColor: user.clinic.colors?.primary || "#2563eb",
        secondaryColor: user.clinic.colors?.secondary || "#64748b",
      });
    }
  }, [user, form]);

  const primaryColor = form.watch("primaryColor");
  const secondaryColor = form.watch("secondaryColor");
  // ...
}
```

**Key Features:**
- **FileUpload for logo:** Uses existing FileUpload component with useFileUrl hook to display current logo
- **Dual color pickers:** Color picker (type="color") + text input for precise hex value control
- **Live preview:** Button samples with gradient bar showing current color selection
- **CSS variable update:** Sets `--primary` on document.documentElement on save
- **Theme-aware styling:** Uses muted-foreground, Card components for dark mode compatibility

### Form Structure

1. **Logo Upload Section**
   - FileUpload component with currentImage from useFileUrl
   - Handles storageId via handleLogoUpload callback

2. **Color Pickers Grid**
   - Primary color: dual input (color + text)
   - Secondary color: dual input (color + text)
   - Both sync via react-hook-form register

3. **Live Preview Section**
   - Two button samples with inline backgroundColor
   - Gradient bar showing primary-to-secondary transition
   - Updates in real-time via form.watch()

4. **Submit Button**
   - Disabled during submission
   - Calls updateClinicAppearance mutation
   - Shows toast feedback

## Decisions Made

### useEffect for Form Reset
React-hook-form defaultValues only apply on mount. Since user data loads async from Convex, used useEffect to reset form values when user?.clinic becomes available.

### Theme-aware Loading State
Loading state uses Card wrapper with muted-foreground color instead of plain text, consistent with project dark mode decisions.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] Logo upload works (FileUpload component integrated)
- [x] Color pickers update preview (form.watch with inline styles)
- [x] Submit updates database (updateClinicAppearance mutation)
- [x] CSS variables update on save (document.documentElement.style.setProperty)

## Commits

| Hash | Message |
|------|---------|
| e63648e | feat(01-26): create appearance form |

## Next Phase Readiness

Ready for 01-28 (settings pages) which will compose this form into the appearance settings page.

**Dependencies satisfied:**
- 01-09 (settings mutations) - updateClinicAppearance mutation exists
- 01-11 (FileUpload component) - integrated for logo upload
