# Implementation Plan

- [-] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - 14 Codebase Bugs (State Mutation, Stale Closures, UI, Security)
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs (1.2, 1.6, 1.7, 1.12, 1.13, 1.14), scope to concrete failing cases; for state-mutation bugs (1.3, 1.4, 1.10, 1.11), generate random app IDs / image keys
  - Test 1.1 — Mount `Window`, simulate `winWidth` change, assert `state.width` is clamped using latest state (stale closure: spread of stale `state` may overwrite concurrent update)
  - Test 1.2 — Render `AppWindow`, assert inner div has class `inner-window` and `overflow-y-auto` (on unfixed code: `innner-window` and `overflow-y-hidden`)
  - Test 1.3 — Call `setAppMax` / `setAppMin`, assert the object passed to `setState` is a NEW reference (on unfixed code: same reference)
  - Test 1.4 — Call `openApp` / `closeApp`, assert `showApps` and `appsZ` are NEW references (on unfixed code: same references)
  - Test 1.5 — Simulate concurrent state update during mount, assert final state is consistent (on unfixed code: concurrent update may be lost)
  - Test 1.6 — Render `Safari` with a URL, assert `<iframe>` has a `sandbox` attribute (on unfixed code: attribute absent)
  - Test 1.7 — Assert URL input has `onKeyDown` handler and NO `onKeyPress` handler (on unfixed code: `onKeyPress` present)
  - Test 1.8 — Trigger two renders of a component using `useAudio`, assert `ref.current` is the same element both times (on unfixed code: new element each render)
  - Test 1.9 — Change `props.src`, assert `ended` listener is removed from the old element (on unfixed code: cleanup targets stale reference)
  - Test 1.10 — Call `addFaceTimeImage`, assert returned `faceTimeImages` is a NEW object reference (on unfixed code: same reference)
  - Test 1.11 — Call `delFaceTimeImage`, assert returned `faceTimeImages` is a NEW object reference (on unfixed code: same reference)
  - Test 1.12 — Render `NavPage`, assert no text node "Phd" is present (on unfixed code: text node visible)
  - Test 1.13 — Render `NavPage`, assert privacy sentence contains "prevented" and "trackers" (on unfixed code: "prevent" and "tracker")
  - Test 1.14 — Render `ControlCenterMenu` with `wifi=true`, assert Wi-Fi button has class `cc-btn-active`; with `wifi=false` assert `cc-btn`; same for bluetooth and airdrop (on unfixed code: classes are inverted)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Behaviors Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: window drag/resize (`onDragStop`, `onResizeStop`) updates `state.x/y/width/height` correctly on unfixed code
  - Observe: Safari with `goURL === ""` renders `NavPage` with favorites and frequently-visited sections on unfixed code
  - Observe: Safari with `wifi === false` renders `NoInternetPage` on unfixed code
  - Observe: `useAudio` `play()`, `pause()`, `toggle()` control `ref.current` correctly on unfixed code
  - Observe: `addFaceTimeImage` adds an entry and `delFaceTimeImage` removes it on unfixed code (even if re-render is missed, the data change occurs)
  - Observe: brightness/volume sliders call `setBrightness`/`setVolume` with correct values on unfixed code
  - Observe: `toggleDark` adds/removes `dark` class on `document.documentElement` on unfixed code
  - Write property-based test: for any sequence of drag/resize events, window position and size are updated correctly (Req 3.1, 3.2)
  - Write property-based test: for any `wifi`/`bluetooth`/`airdrop` boolean combination, slider and dark-mode behaviors are unaffected (Req 3.7, 3.8)
  - Write property-based test: for any set of random image keys, `addFaceTimeImage` and `delFaceTimeImage` produce correct key sets (Req 3.6)
  - Verify all preservation tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 3. Fix all 14 bugs

  - [ ] 3.1 Fix stale closure in AppWindow resize effect (Bug 1.1)
    - In `src/components/AppWindow.tsx`, replace the `useEffect` body with functional `setState`:
      `setState(prev => ({ ...prev, width: Math.min(winWidth, prev.width), height: Math.min(winHeight, prev.height) }))`
    - _Bug_Condition: isBugCondition_1_1 — useEffect dependency array does NOT include state AND setState spreads stale state reference_
    - _Expected_Behavior: resize effect always derives from latest state via functional updater_
    - _Preservation: onDragStop and onResizeStop callbacks must continue to update state correctly (Req 3.1, 3.2)_
    - _Requirements: 2.1, 3.1, 3.2_

  - [ ] 3.2 Fix inner-window class name typo and overflow (Bug 1.2)
    - In `src/components/AppWindow.tsx`, change `className="innner-window w-full overflow-y-hidden"` to `className="inner-window w-full overflow-y-auto"`
    - _Bug_Condition: isBugCondition_1_2 — element.className CONTAINS "innner-window" OR "overflow-y-hidden"_
    - _Expected_Behavior: inner div has class "inner-window" and "overflow-y-auto"_
    - _Preservation: window rendering and content display must remain correct (Req 3.1)_
    - _Requirements: 2.2, 3.1_

  - [ ] 3.3 Fix direct mutation in setAppMax and setAppMin (Bug 1.3)
    - In `src/pages/Desktop.tsx`, replace `const maxApps = state.maxApps` with `const maxApps = { ...state.maxApps }`
    - Replace `const minApps = state.minApps` with `const minApps = { ...state.minApps }`
    - _Bug_Condition: isBugCondition_1_3 — assigns to state.maxApps[id] or state.minApps[id] WITHOUT first creating a shallow copy_
    - _Expected_Behavior: new object reference passed to setState so React detects the change_
    - _Preservation: maximize and minimize animations must continue to work (Req 3.1)_
    - _Requirements: 2.3, 3.1_

  - [ ] 3.4 Fix direct mutation in openApp and closeApp (Bug 1.4)
    - In `src/pages/Desktop.tsx`, replace `const showApps = state.showApps` with `const showApps = { ...state.showApps }` in both `openApp` and `closeApp`
    - Replace `const appsZ = state.appsZ` with `const appsZ = { ...state.appsZ }` in `openApp`
    - Replace the `minApps[id] = false` block in `openApp` with `const minApps = { ...state.minApps }; minApps[id] = false; setState({ ...state, minApps })`
    - _Bug_Condition: isBugCondition_1_4 — assigns to state.showApps[id] or state.appsZ[id] WITHOUT first creating a shallow copy_
    - _Expected_Behavior: new object references passed to setState_
    - _Preservation: open/close animations and z-index ordering must continue to work (Req 3.1)_
    - _Requirements: 2.4, 3.1_

  - [ ] 3.5 Fix stale state in getAppsData / useEffect (Bug 1.5)
    - In `src/pages/Desktop.tsx`, refactor `getAppsData` to return the computed sub-state object
    - Change the `useEffect` to call `setState(prev => ({ ...prev, ...getAppsData() }))` so it does not close over the stale `state` variable
    - _Bug_Condition: isBugCondition_1_5 — effect calls setState({ ...state, ... }) AND state is captured from outer closure AND dependency array is []_
    - _Expected_Behavior: mount effect uses functional setState so concurrent updates are not lost_
    - _Preservation: initial app state (showApps, appsZ, maxApps, minApps) must be set correctly on mount (Req 3.1)_
    - _Requirements: 2.5, 3.1_

  - [ ] 3.6 Add sandbox attribute to Safari iframe (Bug 1.6)
    - In `src/components/apps/Safari.tsx`, add `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` to the `<iframe>` element
    - _Bug_Condition: isBugCondition_1_6 — element.getAttribute("sandbox") IS null_
    - _Expected_Behavior: iframe has sandbox attribute restricting top-level navigation and unrestricted scripts_
    - _Preservation: Safari URL navigation must continue to load pages in the iframe (Req 3.3)_
    - _Requirements: 2.6, 3.3_

  - [ ] 3.7 Replace deprecated onKeyPress with onKeyDown in Safari (Bug 1.7)
    - In `src/components/apps/Safari.tsx`, change `onKeyPress={pressURL}` to `onKeyDown={pressURL}` on the URL input
    - _Bug_Condition: isBugCondition_1_7 — handler is registered as "onKeyPress" (keypress event)_
    - _Expected_Behavior: URL input uses onKeyDown which is supported in all browsers_
    - _Preservation: pressing Enter in the URL bar must continue to navigate (Req 3.3)_
    - _Requirements: 2.7, 3.3_

  - [ ] 3.8 Fix Audio element created on every render in useAudio (Bug 1.8)
    - In `src/hooks/useAudio.ts`, replace `const element = new Audio(props.src); const ref = useRef<HTMLAudioElement>(element)` with lazy ref initialization: `const ref = useRef<HTMLAudioElement | null>(null); if (!ref.current) ref.current = new Audio(props.src)`
    - _Bug_Condition: isBugCondition_1_8 — new Audio() is called outside useRef initializer AND previous Audio element is not cleaned up_
    - _Expected_Behavior: HTMLAudioElement is created exactly once; ref.current is stable across re-renders_
    - _Preservation: play, pause, toggle, and volume controls must continue to work (Req 3.5)_
    - _Requirements: 2.8, 3.5_

  - [ ] 3.9 Fix stale element reference in useAudio ended listener (Bug 1.9)
    - In `src/hooks/useAudio.ts`, replace `element.addEventListener("ended", handler)` and `element.removeEventListener("ended", handler)` with `ref.current?.addEventListener("ended", handler)` and `ref.current?.removeEventListener("ended", handler)`
    - _Bug_Condition: isBugCondition_1_9 — addEventListener/removeEventListener target is `element` (closure variable) AND ref.current is NOT used_
    - _Expected_Behavior: ended listener is always attached to and removed from the current ref instance_
    - _Preservation: autoReplay behavior must continue to work (Req 3.5)_
    - _Requirements: 2.9, 3.5_

  - [ ] 3.10 Fix addFaceTimeImage mutation in user store (Bug 1.10)
    - In `src/stores/slices/user.ts`, replace the updater body with `return { faceTimeImages: { ...state.faceTimeImages, [+new Date()]: v } }`
    - _Bug_Condition: isBugCondition_1_10 — updater assigns images[key] = value on existing object AND returns same reference_
    - _Expected_Behavior: new faceTimeImages object reference returned so Zustand notifies subscribers_
    - _Preservation: FaceTime screenshot capture and sidebar display must continue to work (Req 3.6)_
    - _Requirements: 2.10, 3.6_

  - [ ] 3.11 Fix delFaceTimeImage mutation in user store (Bug 1.11)
    - In `src/stores/slices/user.ts`, replace the updater body with: `const { [k]: _, ...rest } = state.faceTimeImages; return { faceTimeImages: rest }`
    - _Bug_Condition: isBugCondition_1_11 — updater deletes key from existing images object AND returns same reference_
    - _Expected_Behavior: new faceTimeImages object reference returned without the deleted key_
    - _Preservation: FaceTime image deletion must continue to remove the image from the sidebar (Req 3.6)_
    - _Requirements: 2.11, 3.6_

  - [ ] 3.12 Remove stray "Phd" text node from Safari NavPage (Bug 1.12)
    - In `src/components/apps/Safari.tsx`, delete the bare `Phd` text node between the Privacy Report title div and the grid div
    - _Bug_Condition: isBugCondition_1_12 — jsx CONTAINS bare text node "Phd" BETWEEN Privacy Report title div AND privacy grid div_
    - _Expected_Behavior: NavPage renders with no stray text in the Privacy Report section_
    - _Preservation: Privacy Report section layout and tracker count must continue to render correctly (Req 3.3)_
    - _Requirements: 2.12, 3.3_

  - [ ] 3.13 Fix grammar error in Safari privacy copy (Bug 1.13)
    - In `src/components/apps/Safari.tsx`, change the privacy sentence to: `"In the last seven days, Safari has prevented {numTracker} trackers from profiling you."`
    - _Bug_Condition: isBugCondition_1_13 — text CONTAINS "has prevent" OR singular "tracker from"_
    - _Expected_Behavior: privacy copy reads "has prevented" and "trackers"_
    - _Preservation: Privacy Report section must continue to display the tracker count (Req 3.3)_
    - _Requirements: 2.13, 3.3_

  - [ ] 3.14 Fix inverted active state in ControlCenterMenu (Bug 1.14)
    - In `src/components/menus/ControlCenterMenu.tsx`, swap the ternaries for Wi-Fi, Bluetooth, and AirDrop:
      `className={wifi ? "cc-btn-active" : "cc-btn"}`,
      `className={bluetooth ? "cc-btn-active" : "cc-btn"}`,
      `className={airdrop ? "cc-btn-active" : "cc-btn"}`
    - _Bug_Condition: isBugCondition_1_14 — (state.wifi === true AND element.className === "cc-btn") OR (state.wifi === false AND element.className === "cc-btn-active"), same for bluetooth/airdrop_
    - _Expected_Behavior: active toggle receives cc-btn-active; inactive toggle receives cc-btn_
    - _Preservation: Control Center sliders and dark mode toggle must continue to work (Req 3.7, 3.8)_
    - _Requirements: 2.14, 3.7, 3.8_

  - [ ] 3.15 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - All 14 Bug Conditions Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior for all 14 bugs
    - When these tests pass, it confirms the expected behavior is satisfied for each fix
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all 14 bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14_

  - [ ] 3.16 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Behaviors Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Confirm all preservation behaviors are intact after all 14 fixes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise.
