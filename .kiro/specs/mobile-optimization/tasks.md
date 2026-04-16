# Implementation Plan: Mobile Optimization

## Overview

Introduce a dedicated mobile rendering path for the macOS-themed portfolio. A viewport gate in `App` (`src/index.tsx`) conditionally mounts `MobileDesktop` (< 640 px) or the unchanged `Desktop` (≥ 640 px). New components `MobileDesktop` and `MobileAppView` provide the mobile shell. Existing components `Bear`, `FaceTime`, and `ControlCenterMenu` receive targeted responsive adjustments.

## Tasks

- [x] 1. Add viewport gate to `App` (`src/index.tsx`)
  - Call `useWindowSize()` in `App` and conditionally render `MobileDesktop` when `winWidth < 640`, `Desktop` otherwise, passing identical `MacActions` props to both.
  - Import `MobileDesktop` (stub file can be created first and filled in task 2).
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.1 Write property test for rendering gate (P1)
    - **Property 1: Rendering gate is correct for all viewport widths**
    - Use `fc.integer({ min: 0, max: 2000 })` for `winWidth`; assert `MobileDesktop` rendered when `< 640`, `Desktop` when `>= 640`.
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - _Test file: `src/__tests__/App.test.tsx`_

  - [ ]* 1.2 Write property test for MacActions forwarding (P2)
    - **Property 2: MacActions props are forwarded to MobileDesktop**
    - Use `fc.record` with stub callbacks; assert each callback on `MobileDesktop` invokes the original.
    - **Validates: Requirements 1.4**
    - _Test file: `src/__tests__/App.test.tsx`_

- [x] 2. Create `MobileDesktop` component (`src/pages/MobileDesktop.tsx`)
  - Implement full-viewport shell: wallpaper background (day/night from `dark` store), `TopBar`, `Dock`, and single-app state (`openAppId`).
  - When `openAppId` is set, render `MobileAppView` with the matching app content and title; opening a second app replaces the first.
  - Mirror `Desktop`'s `MacActions` prop signature; reuse `wallpapers`, `apps`, and `useStore` exactly as `Desktop` does.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 2.1 Write property test for wallpaper dark/light (P3)
    - **Property 3: Wallpaper reflects dark-mode store value**
    - Use `fc.boolean()` for `dark`; assert background URL equals `wallpapers.night` / `wallpapers.day`.
    - **Validates: Requirements 2.2**
    - _Test file: `src/__tests__/MobileDesktop.test.tsx`_

  - [ ]* 2.2 Write property test for open app renders MobileAppView (P4)
    - **Property 4: Opening any app renders MobileAppView**
    - Use `fc.constantFrom(...appIds)`; assert `MobileAppView` present with correct title.
    - **Validates: Requirements 2.6**
    - _Test file: `src/__tests__/MobileDesktop.test.tsx`_

  - [ ]* 2.3 Write property test for single app at a time (P5)
    - **Property 5: At most one app open at a time**
    - Use `fc.array(fc.constantFrom(...appIds), { minLength: 2 })`; assert only the last opened app is rendered.
    - **Validates: Requirements 2.7**
    - _Test file: `src/__tests__/MobileDesktop.test.tsx`_

- [x] 3. Create `MobileAppView` component (`src/components/MobileAppView.tsx`)
  - Render a fixed title bar (24 px, matching `appBarHeight`) with the app name and a `×` close button.
  - Content area fills remaining height (`calc(100vh - topBarHeight - dockHeight - appBarHeight)`) with `overflow-y-auto`.
  - No `react-rnd`, no `TrafficLights`.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 3.1 Write property test for title bar content (P6)
    - **Property 6: MobileAppView title bar contains app name and close button**
    - Use `fc.string({ minLength: 1 })` for title; assert title string and close button present.
    - **Validates: Requirements 3.2**
    - _Test file: `src/__tests__/MobileAppView.test.tsx`_

  - [ ]* 3.2 Write property test for close button callback (P7)
    - **Property 7: Close button invokes onClose callback**
    - Use `fc.func(fc.constant(undefined))` for `onClose`; assert called exactly once on button click.
    - **Validates: Requirements 3.3**
    - _Test file: `src/__tests__/MobileAppView.test.tsx`_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Adapt `Bear` for mobile (`src/components/apps/Bear.tsx`)
  - Add `useWindowSize()` call inside `Bear`.
  - When `winWidth < 640`: hide sidebar and middlebar columns by default; show a hamburger/nav toggle button; tapping toggle shows sidebar + middlebar as an overlay panel; selecting a middlebar item closes the panel and updates content.
  - When `winWidth >= 640`: existing three-column layout unchanged.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.1 Write property test for Bear mobile default state (P8)
    - **Property 8: Bear hides navigation columns on mobile by default**
    - Use `fc.integer({ min: 0, max: 639 })`; assert sidebar/middlebar absent and toggle button present.
    - **Validates: Requirements 4.1, 4.2**
    - _Test file: `src/__tests__/Bear.mobile.test.tsx`_

  - [ ]* 5.2 Write property test for Bear nav toggle round-trip (P9)
    - **Property 9: Bear nav toggle shows and hides the panel**
    - Use `fc.integer({ min: 0, max: 639 })` and `fc.nat()` for item index; assert toggle → panel visible; select item → panel hidden, content updated.
    - **Validates: Requirements 4.3, 4.4**
    - _Test file: `src/__tests__/Bear.mobile.test.tsx`_

  - [ ]* 5.3 Write property test for Bear desktop layout (P10)
    - **Property 10: Bear three-column layout preserved on desktop**
    - Use `fc.integer({ min: 640, max: 2000 })`; assert all three columns present and no toggle button.
    - **Validates: Requirements 4.5**
    - _Test file: `src/__tests__/Bear.mobile.test.tsx`_

- [x] 6. Adapt `FaceTime` for mobile (`src/components/apps/FaceTime.tsx`)
  - Add `useWindowSize()` call inside `FaceTime`.
  - When `winWidth < 640`: render sidebar above webcam in `flex-col` layout, full width, no `absolute` positioning.
  - When `winWidth >= 640`: existing `absolute w-74` sidebar layout unchanged.
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.1 Write property test for FaceTime layout (P11)
    - **Property 11: FaceTime layout is vertical stack on mobile, absolute overlay on desktop**
    - Use `fc.integer({ min: 0, max: 639 })` and `fc.integer({ min: 640, max: 2000 })`; assert mobile: `flex-col`, no `absolute`; desktop: `absolute` sidebar.
    - **Validates: Requirements 5.1, 5.4**
    - _Test file: `src/__tests__/FaceTime.mobile.test.tsx`_

- [x] 7. Adapt `ControlCenterMenu` for mobile (`src/components/menus/ControlCenterMenu.tsx`)
  - Replace `w-80` with `w-full sm:w-80` so the panel spans the full viewport on mobile.
  - No logic changes — purely a CSS class adjustment.
  - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 7.1 Write property test for ControlCenterMenu width (P12)
    - **Property 12: ControlCenterMenu spans full width on mobile, fixed width on desktop**
    - Use `fc.integer({ min: 0, max: 639 })` and `fc.integer({ min: 640, max: 2000 })`; assert `w-full` on mobile, `w-80` on desktop.
    - **Validates: Requirements 6.1, 6.3**
    - _Test file: `src/__tests__/ControlCenterMenu.mobile.test.tsx`_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- `Desktop` and `AppWindow` are intentionally left unmodified (Requirements 9.1, 9.2)
- `Dock` and `Launchpad` require no structural changes — existing responsive classes already satisfy Requirements 7 and 8
- Property tests use **fast-check** (`fc`) with a minimum of 100 iterations each
- Each property test references its property number from the design document for traceability
