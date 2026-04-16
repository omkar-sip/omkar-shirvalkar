# Bugfix Requirements Document

## Introduction

A broad review of the codebase identified several bugs and security issues spanning
window management, iframe security, state mutation patterns, audio resource leaks,
and stale-closure problems. These issues affect correctness, security, and stability
of the macOS-portfolio React application.

---

## Bug Analysis

### Current Behavior (Defect)

**AppWindow — stale window size on resize**

1.1 WHEN the browser window is resized THEN the `Window` component updates `state.width`/`state.height` via a `useEffect` that reads from `state` inside the effect, causing a stale-closure dependency warning and potentially skipping updates because `state` is not listed as a dependency.

**AppWindow — inner-window height overflow**

1.2 WHEN an `AppWindow` is rendered THEN the inner content `<div>` uses the class `overflow-y-hidden` (note: the class name in the source is `innner-window` with a typo), which silently clips content that overflows vertically instead of scrolling.

**Desktop — direct state mutation in `setAppMax` and `setAppMin`**

1.3 WHEN `setAppMax` or `setAppMin` is called THEN the functions mutate the `maxApps`/`minApps` objects from `state` directly (e.g. `maxApps[id] = target`) before passing them to `setState`, violating React's immutability contract and causing missed re-renders.

**Desktop — direct state mutation in `openApp` and `closeApp`**

1.4 WHEN `openApp` or `closeApp` is called THEN the functions mutate `showApps` and `appsZ` objects from `state` directly before calling `setState`, violating React's immutability contract.

**Desktop — `getAppsData` captures stale `state` in `useEffect`**

1.5 WHEN the component mounts THEN `getAppsData` is called inside a `useEffect` with an empty dependency array, but `getAppsData` references `state` from the outer closure, so any concurrent state update during mount can be silently lost.

**Safari — unthrottled iframe with no sandbox attribute**

1.6 WHEN a user navigates to any URL in the Safari component THEN the `<iframe>` renders without a `sandbox` attribute, allowing the embedded page to run scripts, access top-level navigation, and submit forms — a cross-site scripting and clickjacking risk.

**Safari — `onKeyPress` deprecated event**

1.7 WHEN a user types in the Safari URL bar THEN the component uses the deprecated `onKeyPress` React synthetic event (maps to the deprecated DOM `keypress` event), which is removed in some browsers and will stop working.

**useAudio — Audio element created on every render**

1.8 WHEN the component that calls `useAudio` re-renders THEN `new Audio(props.src)` is called unconditionally at the top of the hook (outside `useRef`/`useMemo`), creating a new `HTMLAudioElement` on every render and leaking the previous element.

**useAudio — event listener attached to stale `element` reference**

1.9 WHEN `useAudio` runs its cleanup `useEffect` THEN the `ended` event listener is added to the `element` variable captured at hook-call time, but the cleanup removes it from the same stale reference; if `props.src` changes the old element is never properly cleaned up.

**User store — `addFaceTimeImage` mutates state directly**

1.10 WHEN `addFaceTimeImage` is called THEN the Zustand slice mutates the existing `images` object (`images[+new Date()] = v`) and returns the same reference, so Zustand's shallow-equality check sees no change and subscribers may not re-render.

**User store — `delFaceTimeImage` mutates state directly**

1.11 WHEN `delFaceTimeImage` is called THEN the Zustand slice mutates the existing `images` object (`delete images[k]`) and returns the same reference, causing the same missed re-render issue as 1.10.

**Safari NavPage — stray text node "Phd" in JSX**

1.12 WHEN the Safari NavPage renders THEN a stray text node `Phd` appears in the Privacy Report section between two `<div>` elements, rendering visible garbage text in the UI.

**Safari — grammar error in privacy report copy**

1.13 WHEN the Safari NavPage renders THEN the privacy report reads "Safari has prevent {numTracker} tracker from profiling you" — both the verb ("prevent" should be "prevented") and the noun ("tracker" should be "trackers") are grammatically incorrect.

**ControlCenterMenu — inverted Wi-Fi button active state**

1.14 WHEN Wi-Fi is enabled (`wifi === true`) THEN the button receives the class `cc-btn` (inactive style) instead of `cc-btn-active`, and vice-versa — the active/inactive classes are swapped for Wi-Fi, Bluetooth, and AirDrop buttons.

---

### Expected Behavior (Correct)

**AppWindow — stale window size on resize**

2.1 WHEN the browser window is resized THEN the `Window` component SHALL clamp `state.width` and `state.height` using the functional form of `setState` (or include the correct dependencies) so the update always reflects the latest state.

**AppWindow — inner-window height overflow**

2.2 WHEN an `AppWindow` is rendered THEN the inner content wrapper SHALL use `overflow-y-auto` (or `overflow-y-scroll`) so content that exceeds the window height is scrollable, and the class name typo `innner-window` SHALL be corrected to `inner-window`.

**Desktop — direct state mutation in `setAppMax` and `setAppMin`**

2.3 WHEN `setAppMax` or `setAppMin` is called THEN the functions SHALL create a shallow copy of `maxApps`/`minApps` (e.g. `{ ...state.maxApps }`) before modifying the copy, preserving React's immutability contract.

**Desktop — direct state mutation in `openApp` and `closeApp`**

2.4 WHEN `openApp` or `closeApp` is called THEN the functions SHALL create shallow copies of `showApps` and `appsZ` before modifying them.

**Desktop — `getAppsData` captures stale `state` in `useEffect`**

2.5 WHEN the component mounts THEN `getAppsData` SHALL use the functional `setState` updater form so it does not depend on the closure-captured `state` value.

**Safari — unthrottled iframe with no sandbox attribute**

2.6 WHEN a user navigates to a URL in the Safari component THEN the `<iframe>` SHALL include `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` to restrict the embedded page's capabilities to the minimum required.

**Safari — `onKeyPress` deprecated event**

2.7 WHEN a user types in the Safari URL bar THEN the component SHALL use `onKeyDown` instead of the deprecated `onKeyPress` event handler.

**useAudio — Audio element created on every render**

2.8 WHEN `useAudio` is called THEN the `HTMLAudioElement` SHALL be created once and stored in a `useRef` (initialised lazily), so no new element is created on re-renders.

**useAudio — event listener attached to stale `element` reference**

2.9 WHEN `useAudio` attaches the `ended` event listener THEN it SHALL use `ref.current` (the stable ref) rather than the `element` variable, and the cleanup SHALL remove the listener from the same `ref.current` reference.

**User store — `addFaceTimeImage` mutates state directly**

2.10 WHEN `addFaceTimeImage` is called THEN the Zustand slice SHALL return a new object (`{ ...images, [+new Date()]: v }`) so Zustand detects the change and notifies subscribers.

**User store — `delFaceTimeImage` mutates state directly**

2.11 WHEN `delFaceTimeImage` is called THEN the Zustand slice SHALL construct a new object without the deleted key (e.g. using destructuring or `Object.fromEntries`) and return it, so Zustand detects the change.

**Safari NavPage — stray text node "Phd"**

2.12 WHEN the Safari NavPage renders THEN the stray `Phd` text node SHALL be removed from the JSX.

**Safari — grammar error in privacy report copy**

2.13 WHEN the Safari NavPage renders THEN the privacy report copy SHALL read "Safari has prevented {numTracker} trackers from profiling you."

**ControlCenterMenu — inverted active state**

2.14 WHEN Wi-Fi (or Bluetooth, or AirDrop) is enabled THEN the corresponding button SHALL receive `cc-btn-active` and when disabled it SHALL receive `cc-btn`, matching the intended visual active/inactive states.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user opens, closes, minimizes, or maximizes an app window THEN the system SHALL CONTINUE TO animate and position windows correctly.

3.2 WHEN a user resizes an app window by dragging THEN the system SHALL CONTINUE TO update the window dimensions via the `onResizeStop` callback without regression.

3.3 WHEN the Safari component loads with no URL entered THEN the system SHALL CONTINUE TO display the NavPage with favorites and frequently-visited sections.

3.4 WHEN the Safari component is used with Wi-Fi disabled THEN the system SHALL CONTINUE TO display the NoInternetPage.

3.5 WHEN `useAudio` is used to play, pause, or toggle audio THEN the system SHALL CONTINUE TO control playback correctly after the Audio element creation is moved into a ref.

3.6 WHEN FaceTime takes and saves a screenshot THEN the system SHALL CONTINUE TO store the image and display it in the sidebar.

3.7 WHEN the Control Center volume or brightness sliders are adjusted THEN the system SHALL CONTINUE TO update the corresponding store values and apply them to the UI.

3.8 WHEN the dark mode toggle is activated THEN the system SHALL CONTINUE TO add/remove the `dark` class on `document.documentElement` and update the store.

3.9 WHEN the Terminal processes `cd`, `ls`, `cat`, `clear`, and `help` commands THEN the system SHALL CONTINUE TO produce the correct output for each command.

3.10 WHEN the login screen is shown and the correct password (or empty password) is entered THEN the system SHALL CONTINUE TO transition to the Desktop.
