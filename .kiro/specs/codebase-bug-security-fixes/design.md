# Codebase Bug & Security Fixes — Bugfix Design

## Overview

This document formalizes the fix strategy for 14 bugs and security issues identified across
the macOS-portfolio React application. The issues span five areas:

- **AppWindow**: stale-closure resize effect and inner-window overflow/typo
- **Desktop**: direct state mutation in `setAppMax`, `setAppMin`, `openApp`, `closeApp`, and stale `state` capture in `getAppsData`
- **Safari**: missing `sandbox` attribute on `<iframe>`, deprecated `onKeyPress` event, stray text node, and grammar error
- **useAudio**: `Audio` element created on every render and stale `element` reference in cleanup
- **User store**: direct mutation of `faceTimeImages` in `addFaceTimeImage` and `delFaceTimeImage`
- **ControlCenterMenu**: inverted active/inactive CSS classes for Wi-Fi, Bluetooth, and AirDrop buttons

The fix strategy is minimal and targeted: each change is isolated to the specific line(s) that
introduce the defect, with no refactoring of surrounding logic.

---

## Glossary

- **Bug_Condition (C)**: The set of runtime inputs or code paths that trigger a defective behavior.
- **Property (P)**: The observable correct behavior that must hold for all inputs satisfying C.
- **Preservation**: All behaviors that must remain unchanged after the fix is applied.
- **isBugCondition**: Pseudocode predicate that returns `true` when a given input triggers the bug.
- **expectedBehavior**: Pseudocode predicate that returns `true` when the output is correct.
- **AppWindow / Window**: `src/components/AppWindow.tsx` — renders a resizable, draggable app window.
- **Desktop**: `src/pages/Desktop.tsx` — manages open/close/min/max state for all app windows.
- **Safari**: `src/components/apps/Safari.tsx` — browser-like component with iframe and NavPage.
- **useAudio**: `src/hooks/useAudio.ts` — custom hook that wraps `HTMLAudioElement`.
- **UserSlice**: `src/stores/slices/user.ts` — Zustand slice managing FaceTime screenshot images.
- **ControlCenterMenu**: `src/components/menus/ControlCenterMenu.tsx` — system control panel overlay.
- **stale closure**: A closure that captures a variable whose value has since changed, causing the closure to operate on an outdated value.
- **immutability contract**: React and Zustand's requirement that state objects are never mutated in-place; new object references must be returned to trigger re-renders.

---

## Bug Details

### Bug Condition

The bugs manifest across multiple independent code paths. Each is described with its own
formal specification below.

---

#### 1.1 — AppWindow: stale window size on resize

The `useEffect` in `Window` reads `state.width` and `state.height` from the outer closure
without listing `state` as a dependency, so the effect may run with a stale snapshot of
`state` and silently skip the update.

**Formal Specification:**
```
FUNCTION isBugCondition_1_1(trigger)
  INPUT: trigger — a browser window resize event
  OUTPUT: boolean

  RETURN useEffect_dependency_array does NOT include state
         AND setState call spreads stale state reference
END FUNCTION
```

**Example:** User resizes the browser window while an app window is open. The `Window`
component's `useEffect` fires but spreads the stale `state` object, potentially overwriting
a concurrent position update with outdated values.

---

#### 1.2 — AppWindow: inner-window overflow and class name typo

The inner content `<div>` uses `overflow-y-hidden` (clips content) and the class name
`innner-window` (triple-n typo).

**Formal Specification:**
```
FUNCTION isBugCondition_1_2(element)
  INPUT: element — the inner content div of any AppWindow
  OUTPUT: boolean

  RETURN element.className CONTAINS "innner-window"
         OR element.className CONTAINS "overflow-y-hidden"
END FUNCTION
```

**Example:** A tall app (e.g., Typora) renders content taller than the window height.
The content is silently clipped with no scrollbar.

---

#### 1.3 — Desktop: direct mutation in `setAppMax` / `setAppMin`

Both functions grab a reference to the existing state object and mutate it before passing
it to `setState`, violating React's immutability contract.

**Formal Specification:**
```
FUNCTION isBugCondition_1_3(call)
  INPUT: call — an invocation of setAppMax or setAppMin
  OUTPUT: boolean

  RETURN call assigns to state.maxApps[id] or state.minApps[id]
         WITHOUT first creating a shallow copy
END FUNCTION
```

**Example:** `setAppMax("safari")` sets `maxApps["safari"] = true` on the existing object.
React's reconciler may not detect the change because the object reference is identical.

---

#### 1.4 — Desktop: direct mutation in `openApp` / `closeApp`

Same pattern as 1.3 but for `showApps` and `appsZ`.

**Formal Specification:**
```
FUNCTION isBugCondition_1_4(call)
  INPUT: call — an invocation of openApp or closeApp
  OUTPUT: boolean

  RETURN call assigns to state.showApps[id] or state.appsZ[id]
         WITHOUT first creating a shallow copy
END FUNCTION
```

---

#### 1.5 — Desktop: stale `state` in `getAppsData` / `useEffect`

`getAppsData` is called inside a `useEffect` with `[]` dependencies, but it closes over
the `state` variable from the render scope. Any concurrent state update during mount can
be silently overwritten.

**Formal Specification:**
```
FUNCTION isBugCondition_1_5(effect)
  INPUT: effect — the mount useEffect in Desktop
  OUTPUT: boolean

  RETURN effect calls setState({ ...state, ... })
         AND state is captured from outer closure
         AND dependency array is []
END FUNCTION
```

---

#### 1.6 — Safari: iframe missing `sandbox` attribute

The `<iframe>` renders without a `sandbox` attribute, allowing the embedded page full
script execution, top-level navigation, and form submission.

**Formal Specification:**
```
FUNCTION isBugCondition_1_6(element)
  INPUT: element — the <iframe> rendered by Safari
  OUTPUT: boolean

  RETURN element.getAttribute("sandbox") IS null
END FUNCTION
```

**Example:** A malicious site loaded in the iframe can navigate the top-level window
(`window.top.location`) or submit forms to third-party origins.

---

#### 1.7 — Safari: deprecated `onKeyPress`

The URL bar uses `onKeyPress`, which is deprecated and removed in some browsers.

**Formal Specification:**
```
FUNCTION isBugCondition_1_7(handler)
  INPUT: handler — the keyboard event handler on the URL input
  OUTPUT: boolean

  RETURN handler is registered as "onKeyPress" (keypress event)
END FUNCTION
```

---

#### 1.8 — useAudio: Audio element created on every render

`new Audio(props.src)` is called unconditionally at the top of the hook, outside any
memoization, creating a new `HTMLAudioElement` on every render and leaking the previous one.

**Formal Specification:**
```
FUNCTION isBugCondition_1_8(render)
  INPUT: render — any re-render of a component using useAudio
  OUTPUT: boolean

  RETURN new Audio() is called outside useRef initializer
         AND previous Audio element is not paused or cleaned up
END FUNCTION
```

---

#### 1.9 — useAudio: stale `element` reference in cleanup

The `ended` event listener is added to and removed from the `element` variable captured
at hook-call time. If `props.src` changes, the old element is never cleaned up.

**Formal Specification:**
```
FUNCTION isBugCondition_1_9(effect)
  INPUT: effect — the cleanup useEffect in useAudio
  OUTPUT: boolean

  RETURN addEventListener target is `element` (closure variable)
         AND removeEventListener target is `element` (same stale reference)
         AND ref.current is NOT used
END FUNCTION
```

---

#### 1.10 — User store: `addFaceTimeImage` mutates state

The Zustand updater mutates the existing `images` object and returns the same reference,
so Zustand's shallow-equality check sees no change.

**Formal Specification:**
```
FUNCTION isBugCondition_1_10(call)
  INPUT: call — an invocation of addFaceTimeImage
  OUTPUT: boolean

  RETURN updater assigns images[key] = value on existing object
         AND returns { faceTimeImages: images } (same reference)
END FUNCTION
```

---

#### 1.11 — User store: `delFaceTimeImage` mutates state

Same pattern as 1.10 but uses `delete images[k]`.

**Formal Specification:**
```
FUNCTION isBugCondition_1_11(call)
  INPUT: call — an invocation of delFaceTimeImage
  OUTPUT: boolean

  RETURN updater deletes key from existing images object
         AND returns { faceTimeImages: images } (same reference)
END FUNCTION
```

---

#### 1.12 — Safari NavPage: stray "Phd" text node

A bare `Phd` text node appears in JSX between two `<div>` elements in the Privacy Report
section, rendering visible garbage text.

**Formal Specification:**
```
FUNCTION isBugCondition_1_12(jsx)
  INPUT: jsx — the rendered output of NavPage
  OUTPUT: boolean

  RETURN jsx CONTAINS bare text node "Phd"
         BETWEEN Privacy Report title div AND privacy grid div
END FUNCTION
```

---

#### 1.13 — Safari NavPage: grammar error in privacy copy

The privacy report reads "Safari has prevent {n} tracker from profiling you" — both the
verb and noun are incorrect.

**Formal Specification:**
```
FUNCTION isBugCondition_1_13(text)
  INPUT: text — the privacy report sentence
  OUTPUT: boolean

  RETURN text CONTAINS "has prevent" OR text CONTAINS "tracker from"
         (where tracker is singular and should be plural)
END FUNCTION
```

---

#### 1.14 — ControlCenterMenu: inverted active state

When `wifi === true`, the button receives `cc-btn` (inactive style) instead of
`cc-btn-active`. The ternary is backwards for Wi-Fi, Bluetooth, and AirDrop.

**Formal Specification:**
```
FUNCTION isBugCondition_1_14(state, element)
  INPUT: state — { wifi, bluetooth, airdrop } booleans
         element — the corresponding button div
  OUTPUT: boolean

  RETURN (state.wifi === true AND element.className === "cc-btn")
      OR (state.wifi === false AND element.className === "cc-btn-active")
      OR same pattern for bluetooth / airdrop
END FUNCTION
```

**Example:** Wi-Fi is enabled. The Wi-Fi button renders with the grey inactive style
instead of the blue active style.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Opening, closing, minimizing, and maximizing app windows must continue to animate and position correctly (Req 3.1).
- Dragging to resize an app window must continue to update dimensions via `onResizeStop` (Req 3.2).
- Safari with no URL entered must continue to display the NavPage with favorites and frequently-visited sections (Req 3.3).
- Safari with Wi-Fi disabled must continue to display the NoInternetPage (Req 3.4).
- `useAudio` play, pause, and toggle controls must continue to work after the Audio element is moved into a ref (Req 3.5).
- FaceTime screenshot capture and sidebar display must continue to work after the store fix (Req 3.6).
- Control Center volume and brightness sliders must continue to update store values (Req 3.7).
- Dark mode toggle must continue to add/remove the `dark` class and update the store (Req 3.8).
- Terminal commands (`cd`, `ls`, `cat`, `clear`, `help`) must continue to produce correct output (Req 3.9).
- Login screen password flow must continue to transition to the Desktop (Req 3.10).

**Scope:**
All behaviors not directly related to the 14 identified defects must be completely unaffected.
The fixes are surgical: each touches only the specific expression or attribute that is wrong.

---

## Hypothesized Root Cause

1. **Stale closure in `useEffect` (1.1, 1.5, 1.9)**: Developers spread `state` inside effects
   without listing it as a dependency, or use a closure-captured variable instead of a stable
   ref. React's linter rule `exhaustive-deps` would catch these if enabled.

2. **Direct object mutation before `setState` (1.3, 1.4, 1.10, 1.11)**: A common mistake
   where developers grab a reference to a state sub-object, mutate it, then pass it back.
   Because the reference is unchanged, React and Zustand's shallow-equality checks see no
   difference and may skip re-renders.

3. **Missing or deprecated HTML/React attributes (1.6, 1.7)**: The `sandbox` attribute was
   likely omitted for convenience during development. `onKeyPress` is a legacy API that was
   not updated when the component was written.

4. **Audio element lifecycle mismanagement (1.8)**: `new Audio()` was placed at the top of
   the hook body rather than inside a `useRef` initializer, a subtle mistake when converting
   imperative code to a hook.

5. **CSS class typo and wrong class name (1.2, 1.14)**: `innner-window` is a simple typo.
   The inverted ternary in ControlCenterMenu is a logic inversion — the condition was likely
   written as "if NOT active, use active style" by mistake.

6. **Stray JSX text and copy error (1.12, 1.13)**: `Phd` appears to be a leftover debug
   string. The grammar errors are copy-editing oversights.

---

## Correctness Properties

Property 1: Bug Condition — Functional State Updates Prevent Stale Closures

_For any_ re-render or concurrent state update, the fixed `Window` resize effect and
`getAppsData` SHALL use the functional `setState(prev => ...)` form so that the update
always derives from the latest state, never from a stale closure capture.

**Validates: Requirements 2.1, 2.5**

Property 2: Bug Condition — Immutable State Copies Trigger Re-renders

_For any_ call to `setAppMax`, `setAppMin`, `openApp`, `closeApp`, `addFaceTimeImage`, or
`delFaceTimeImage`, the fixed functions SHALL create a new object reference (shallow copy)
before modifying it, so React and Zustand detect the change and notify all subscribers.

**Validates: Requirements 2.3, 2.4, 2.10, 2.11**

Property 3: Bug Condition — iframe Sandbox Restricts Embedded Content

_For any_ URL loaded in the Safari iframe, the fixed `<iframe>` SHALL include
`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`, preventing the
embedded page from navigating the top-level window or executing unrestricted scripts.

**Validates: Requirements 2.6**

Property 4: Bug Condition — Audio Ref Stability Prevents Element Leaks

_For any_ re-render of a component using `useAudio`, the fixed hook SHALL create the
`HTMLAudioElement` exactly once (via lazy `useRef` initialization) and SHALL attach/detach
the `ended` listener using `ref.current`, so no element is leaked and cleanup is always
applied to the correct instance.

**Validates: Requirements 2.8, 2.9**

Property 5: Bug Condition — UI Correctness Fixes

_For any_ render of `AppWindow`, `Safari NavPage`, or `ControlCenterMenu`, the fixed code
SHALL: use `overflow-y-auto` and the class name `inner-window`; omit the stray `Phd` text
node; use grammatically correct privacy copy; use `onKeyDown` instead of `onKeyPress`; and
apply `cc-btn-active` when a toggle is enabled and `cc-btn` when disabled.

**Validates: Requirements 2.2, 2.7, 2.12, 2.13, 2.14**

Property 6: Preservation — Non-Buggy Behaviors Unchanged

_For any_ input that does NOT trigger one of the 14 bug conditions (window drag/resize,
audio playback controls, Terminal commands, Login flow, dark mode toggle, slider adjustments),
the fixed code SHALL produce exactly the same behavior as the original code.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

---

## Fix Implementation

### Changes Required

**File: `src/components/AppWindow.tsx`**

1. **Fix stale closure in resize effect (1.1)**: Replace the `useEffect` body with the
   functional `setState` form:
   ```ts
   useEffect(() => {
     setState(prev => ({
       ...prev,
       width: Math.min(winWidth, prev.width),
       height: Math.min(winHeight, prev.height)
     }));
   }, [winWidth, winHeight]);
   ```

2. **Fix inner-window class name and overflow (1.2)**: Change
   `className="innner-window w-full overflow-y-hidden"` to
   `className="inner-window w-full overflow-y-auto"`.

---

**File: `src/pages/Desktop.tsx`**

3. **Fix mutation in `setAppMax` (1.3)**: Replace `const maxApps = state.maxApps` with
   `const maxApps = { ...state.maxApps }`.

4. **Fix mutation in `setAppMin` (1.3)**: Replace `const minApps = state.minApps` with
   `const minApps = { ...state.minApps }`.

5. **Fix mutation in `closeApp` (1.4)**: Replace `const showApps = state.showApps` with
   `const showApps = { ...state.showApps }`.

6. **Fix mutation in `openApp` (1.4)**: Replace both `const showApps = state.showApps` and
   `const appsZ = state.appsZ` with spread copies. Also replace the second `minApps[id] = false`
   block with a spread copy.

7. **Fix stale state in `getAppsData` / `useEffect` (1.5)**: Refactor `getAppsData` to
   return the computed sub-state and call `setState(prev => ({ ...prev, ...computed }))`.

---

**File: `src/components/apps/Safari.tsx`**

8. **Add sandbox to iframe (1.6)**: Add
   `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` to the `<iframe>`.

9. **Replace `onKeyPress` with `onKeyDown` (1.7)**: Change `onKeyPress={pressURL}` to
   `onKeyDown={pressURL}`.

10. **Remove stray "Phd" text node (1.12)**: Delete the bare `Phd` text between the
    Privacy Report title div and the grid div.

11. **Fix grammar in privacy copy (1.13)**: Change
    `"Safari has prevent {numTracker} tracker from profiling you."` to
    `"In the last seven days, Safari has prevented {numTracker} trackers from profiling you."`.

---

**File: `src/hooks/useAudio.ts`**

12. **Create Audio element once via lazy ref (1.8)**: Replace
    ```ts
    const element = new Audio(props.src);
    const ref = useRef<HTMLAudioElement>(element);
    ```
    with
    ```ts
    const ref = useRef<HTMLAudioElement | null>(null);
    if (!ref.current) ref.current = new Audio(props.src);
    ```

13. **Use `ref.current` in event listener effect (1.9)**: Replace `element.addEventListener`
    and `element.removeEventListener` with `ref.current?.addEventListener` and
    `ref.current?.removeEventListener`.

---

**File: `src/stores/slices/user.ts`**

14. **Fix `addFaceTimeImage` mutation (1.10)**: Replace the updater body with:
    ```ts
    return { faceTimeImages: { ...state.faceTimeImages, [+new Date()]: v } };
    ```

15. **Fix `delFaceTimeImage` mutation (1.11)**: Replace the updater body with:
    ```ts
    const { [k]: _, ...rest } = state.faceTimeImages;
    return { faceTimeImages: rest };
    ```

---

**File: `src/components/menus/ControlCenterMenu.tsx`**

16. **Fix inverted active state (1.14)**: For Wi-Fi, Bluetooth, and AirDrop, swap the
    ternary so that `true` maps to `cc-btn-active` and `false` maps to `cc-btn`:
    ```tsx
    className={`${wifi ? "cc-btn-active" : "cc-btn"}`}
    className={`${bluetooth ? "cc-btn-active" : "cc-btn"}`}
    className={`${airdrop ? "cc-btn-active" : "cc-btn"}`}
    ```

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach: first surface counterexamples on unfixed code to
confirm root cause analysis, then verify the fix and run preservation checks.

---

### Exploratory Bug Condition Checking

**Goal**: Demonstrate each bug on the unfixed code to confirm the root cause before applying
the fix. If a test does not fail on unfixed code, re-examine the hypothesis.

**Test Cases:**

1. **Stale resize effect (1.1)**: Mount `Window` with a fixed size, simulate a `winWidth`
   change, and assert that `state.width` is clamped correctly. On unfixed code the spread
   of stale `state` may overwrite a concurrent position update.

2. **Inner-window overflow (1.2)**: Render `AppWindow` and assert the inner div has class
   `inner-window` and `overflow-y-auto`. On unfixed code both assertions fail.

3. **State mutation — setAppMax (1.3)**: Call `setAppMax` and assert that the `maxApps`
   object passed to `setState` is a new reference. On unfixed code it is the same reference.

4. **State mutation — openApp (1.4)**: Call `openApp` and assert `showApps` and `appsZ`
   are new references. On unfixed code they are the same references.

5. **Stale getAppsData (1.5)**: Simulate a concurrent state update during mount and assert
   the final state is consistent. On unfixed code the concurrent update may be lost.

6. **iframe sandbox (1.6)**: Render `Safari` with a URL and assert the iframe has a
   `sandbox` attribute. On unfixed code the attribute is absent.

7. **onKeyPress deprecated (1.7)**: Assert the URL input has an `onKeyDown` handler and
   no `onKeyPress` handler. On unfixed code `onKeyPress` is present.

8. **Audio element leak (1.8)**: Call `useAudio` twice in the same component and assert
   `ref.current` is the same element both times. On unfixed code a new element is created
   each render.

9. **Stale element ref (1.9)**: Change `props.src` and assert the `ended` listener is
   removed from the old element. On unfixed code the cleanup targets the stale reference.

10. **addFaceTimeImage mutation (1.10)**: Call `addFaceTimeImage` and assert the returned
    `faceTimeImages` is a new object reference. On unfixed code it is the same reference.

11. **delFaceTimeImage mutation (1.11)**: Same as above for `delFaceTimeImage`.

12. **Stray Phd text (1.12)**: Render `NavPage` and assert no text node "Phd" is present.
    On unfixed code the text node is visible.

13. **Grammar error (1.13)**: Render `NavPage` and assert the privacy sentence contains
    "prevented" and "trackers". On unfixed code it contains "prevent" and "tracker".

14. **Inverted active state (1.14)**: Render `ControlCenterMenu` with `wifi=true` and
    assert the Wi-Fi button has class `cc-btn-active`. On unfixed code it has `cc-btn`.

**Expected Counterexamples:**
- Class name assertions fail for 1.2 and 1.14.
- Attribute presence assertions fail for 1.6 and 1.7.
- Object reference identity assertions fail for 1.3, 1.4, 1.10, 1.11.
- Text content assertions fail for 1.12 and 1.13.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces
the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition_N(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior_N(result)
END FOR
```

Each of the 14 exploratory tests above is re-run against the fixed code and must pass.

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code
produces the same result as the original code.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_N(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for the state mutation fixes
(1.3, 1.4, 1.10, 1.11) because the input space (arbitrary app IDs, image keys) is large.
For the remaining fixes, targeted unit tests are sufficient.

**Preservation Test Cases:**

1. **Window drag/resize (3.1, 3.2)**: After the resize effect fix, assert that dragging
   and `onResizeStop` still update `state.x`, `state.y`, `state.width`, `state.height`.

2. **Safari NavPage with no URL (3.3)**: After Safari fixes, assert that `goURL === ""`
   still renders `NavPage` with favorites and frequently-visited sections.

3. **Safari NoInternetPage (3.4)**: Assert that `wifi === false` still renders
   `NoInternetPage`.

4. **Audio playback controls (3.5)**: After the ref fix, assert that `play()`, `pause()`,
   and `toggle()` still control `ref.current` correctly.

5. **FaceTime image store (3.6)**: After the store fix, assert that `addFaceTimeImage`
   adds an entry and `delFaceTimeImage` removes it, and that subscribers re-render.

6. **Control Center sliders (3.7)**: Assert that brightness and volume sliders still call
   `setBrightness` / `setVolume` with the correct values.

7. **Dark mode toggle (3.8)**: Assert that `toggleDark` still adds/removes the `dark`
   class on `document.documentElement`.

---

### Unit Tests

- Test each of the 14 bug conditions individually with a minimal render or function call.
- Test edge cases: `setAppMax` called with `target` explicitly `false`; `delFaceTimeImage`
  called with a key that does not exist; `useAudio` called with `autoReplay=false`.
- Test that `onKeyDown` fires correctly when Enter is pressed in the Safari URL bar.

### Property-Based Tests

- Generate random sets of app IDs and assert that after any sequence of `openApp`,
  `closeApp`, `setAppMax`, `setAppMin` calls, the state objects are always new references
  (immutability property).
- Generate random `faceTimeImages` objects and assert that `addFaceTimeImage` and
  `delFaceTimeImage` always return new references with the correct keys.
- Generate random `wifi`/`bluetooth`/`airdrop` boolean combinations and assert that the
  correct CSS class (`cc-btn-active` vs `cc-btn`) is applied to each button.

### Integration Tests

- Full app open/close/minimize/maximize flow with the fixed Desktop, asserting correct
  visual state at each step.
- Safari URL navigation flow: enter URL → iframe renders with sandbox attribute → back
  button clears URL → NavPage renders without stray text.
- FaceTime capture flow: take screenshot → image appears in sidebar → delete image →
  image removed from sidebar, with no missed re-renders.
