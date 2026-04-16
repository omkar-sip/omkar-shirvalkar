# Requirements Document

## Introduction

This feature adds a mobile-optimized experience to the macOS-themed portfolio web app. On viewports narrower than 640px, the app renders a dedicated `MobileDesktop` component instead of the existing `Desktop` component. The mobile shell presents a full-screen, single-app-at-a-time interface with no drag-and-resize behavior. The existing desktop code path is left completely untouched. Boot and Login pages already handle small screens and require no changes.

## Glossary

- **App**: The root React component rendered by `src/index.tsx`.
- **Desktop**: The existing `src/pages/Desktop.tsx` component — the macOS-style windowed environment for viewports ≥ 640px.
- **MobileDesktop**: The new `src/pages/MobileDesktop.tsx` component — the full-screen mobile shell for viewports < 640px.
- **MobileAppView**: The new `src/components/MobileAppView.tsx` component — a full-screen wrapper that hosts a single open app on mobile.
- **AppWindow**: The existing `src/components/AppWindow.tsx` drag-and-resize window component used exclusively on Desktop.
- **Dock**: The existing `src/components/dock/Dock.tsx` bottom navigation bar.
- **TopBar**: The existing `src/components/menus/TopBar.tsx` menu bar.
- **ControlCenterMenu**: The existing `src/components/menus/ControlCenterMenu.tsx` overlay panel.
- **Bear**: The existing `src/components/apps/Bear.tsx` markdown reader app with a three-column layout (sidebar, middlebar, content).
- **FaceTime**: The existing `src/components/apps/FaceTime.tsx` webcam app with an absolute-positioned sidebar overlay.
- **Breakpoint**: The 640px viewport width threshold that separates mobile from desktop rendering.
- **useWindowSize**: The existing hook at `src/hooks/useWindowSize.ts` that returns `winWidth` and `winHeight`.

---

## Requirements

### Requirement 1: Viewport-Based Rendering Gate

**User Story:** As a mobile visitor, I want the portfolio to render a layout designed for small screens, so that I can navigate and read content without horizontal scrolling or broken windows.

#### Acceptance Criteria

1. WHEN the App component mounts and `winWidth` is less than 640, THE App SHALL render MobileDesktop in place of Desktop.
2. WHEN the App component mounts and `winWidth` is greater than or equal to 640, THE App SHALL render Desktop unchanged.
3. WHEN the viewport is resized across the 640px Breakpoint while the app is running, THE App SHALL switch between MobileDesktop and Desktop without a full page reload.
4. THE App SHALL pass the same `MacActions` props (`setLogin`, `shutMac`, `sleepMac`, `restartMac`) to MobileDesktop as it currently passes to Desktop.
5. THE Desktop component SHALL remain unmodified by this feature.

---

### Requirement 2: Mobile Desktop Shell

**User Story:** As a mobile visitor, I want a home screen that shows the wallpaper, TopBar, and Dock, so that the experience feels like a simplified macOS environment.

#### Acceptance Criteria

1. THE MobileDesktop SHALL render a full-viewport container that fills 100% of the screen width and height with no overflow.
2. THE MobileDesktop SHALL display the wallpaper image (day or night based on the `dark` store value) as a full-cover background.
3. THE MobileDesktop SHALL render TopBar at the top of the screen.
4. THE MobileDesktop SHALL render Dock at the bottom of the screen.
5. WHEN no app is open, THE MobileDesktop SHALL display only the wallpaper, TopBar, and Dock.
6. WHEN an app is opened via the Dock, THE MobileDesktop SHALL render MobileAppView covering the full screen above the Dock.
7. THE MobileDesktop SHALL track at most one open app at a time; opening a second app SHALL replace the currently open app.

---

### Requirement 3: Mobile App View

**User Story:** As a mobile visitor, I want each app to open full-screen with a close button, so that I can use the app without drag-and-resize controls.

#### Acceptance Criteria

1. THE MobileAppView SHALL render the app content filling 100% of the available viewport height minus the TopBar and Dock heights.
2. THE MobileAppView SHALL display a title bar containing the app name and a close button.
3. WHEN the close button is activated, THE MobileAppView SHALL notify MobileDesktop to clear the open app, returning to the home screen.
4. THE MobileAppView SHALL NOT use `react-rnd` or any drag-and-resize behavior.
5. THE MobileAppView SHALL NOT render TrafficLights (the red/yellow/green window controls).
6. WHEN the app content overflows vertically, THE MobileAppView SHALL allow vertical scrolling within the content area.

---

### Requirement 4: Bear App — Collapsible Sidebar on Mobile

**User Story:** As a mobile visitor reading the Bear markdown app, I want to navigate between sections without a permanently visible three-column layout, so that the content area uses the full screen width.

#### Acceptance Criteria

1. WHILE `winWidth` is less than 640, THE Bear component SHALL hide the sidebar and middlebar columns by default, showing only the content column.
2. WHILE `winWidth` is less than 640, THE Bear component SHALL display a navigation toggle button that reveals the sidebar and middlebar.
3. WHEN the navigation toggle is activated on mobile, THE Bear component SHALL show the sidebar and middlebar as an overlay or slide-in panel.
4. WHEN a middlebar item is selected on mobile, THE Bear component SHALL close the navigation panel and display the selected content.
5. WHILE `winWidth` is greater than or equal to 640, THE Bear component SHALL render the existing three-column layout unchanged.

---

### Requirement 5: FaceTime App — Stacked Layout on Mobile

**User Story:** As a mobile visitor using FaceTime, I want the sidebar and webcam view to stack vertically, so that neither panel is clipped or hidden behind the other.

#### Acceptance Criteria

1. WHILE `winWidth` is less than 640, THE FaceTime component SHALL render the sidebar above the webcam view in a vertical stack rather than as an absolute overlay.
2. WHILE `winWidth` is less than 640, THE FaceTime sidebar SHALL occupy the full width of the container.
3. WHILE `winWidth` is less than 640, THE FaceTime webcam view SHALL occupy the remaining vertical space below the sidebar.
4. WHILE `winWidth` is greater than or equal to 640, THE FaceTime component SHALL render the existing absolute-positioned sidebar layout unchanged.

---

### Requirement 6: ControlCenterMenu — Full-Width on Mobile

**User Story:** As a mobile visitor, I want the Control Center panel to span the full screen width, so that the sliders and toggle buttons are easy to tap.

#### Acceptance Criteria

1. WHILE `winWidth` is less than 640, THE ControlCenterMenu SHALL be positioned to span the full viewport width with no horizontal margin.
2. WHILE `winWidth` is less than 640, THE ControlCenterMenu SHALL be anchored below the TopBar and aligned to the right edge of the screen.
3. WHILE `winWidth` is greater than or equal to 640, THE ControlCenterMenu SHALL retain its existing `w-80` fixed-width positioning unchanged.

---

### Requirement 7: Dock Behavior on Mobile

**User Story:** As a mobile visitor, I want the Dock to be horizontally scrollable when all app icons do not fit on screen, so that I can access every app without icons being clipped.

#### Acceptance Criteria

1. WHILE `winWidth` is less than 640, THE Dock SHALL allow horizontal scrolling when the total icon width exceeds the viewport width.
2. WHILE `winWidth` is less than 640, THE Dock SHALL span the full viewport width.
3. WHILE `winWidth` is greater than or equal to 640, THE Dock SHALL retain its existing auto-width centered layout unchanged.
4. THE Dock component SHALL NOT be modified structurally; the existing `overflow-x-scroll sm:overflow-x-visible` and `w-full sm:w-max` classes already satisfy criteria 1–3.

---

### Requirement 8: Launchpad on Mobile

**User Story:** As a mobile visitor, I want the Launchpad grid to show fewer columns so app icons are large enough to tap comfortably.

#### Acceptance Criteria

1. WHILE `winWidth` is less than 640, THE Launchpad SHALL render app icons in a 4-column grid.
2. WHILE `winWidth` is greater than or equal to 640, THE Launchpad SHALL render app icons in a 7-column grid.
3. THE Launchpad SHALL retain its existing search bar and backdrop-blur background on all viewport sizes.
4. THE Launchpad component SHALL require only minor class adjustments to satisfy criteria 1–2, as the responsive grid classes already exist.

---

### Requirement 9: No Regression on Desktop

**User Story:** As a desktop visitor, I want the existing macOS desktop experience to be completely unaffected by the mobile optimization work, so that nothing breaks on larger screens.

#### Acceptance Criteria

1. THE Desktop component SHALL NOT be modified as part of this feature.
2. THE AppWindow component SHALL NOT be modified as part of this feature.
3. WHEN `winWidth` is greater than or equal to 640, THE App SHALL render the identical component tree as before this feature was introduced.
4. IF a regression is introduced in the Desktop rendering path, THEN THE App SHALL be reverted to the pre-feature state for that path.
