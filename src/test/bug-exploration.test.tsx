/**
 * Bug Condition Exploration Tests
 * 
 * These tests MUST FAIL on unfixed code to confirm the bugs exist.
 * When they fail, it proves the root cause analysis is correct.
 * 
 * DO NOT fix the code when these tests fail - that's the expected outcome!
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import React from "react";

/**
 * Test 1.1: Stale closure in AppWindow resize effect
 * **Validates: Requirements 1.1**
 * 
 * Bug: useEffect spreads stale `state` without listing it as a dependency
 * Expected on unfixed code: Test FAILS - concurrent updates are lost
 */
describe("Bug 1.1: Stale closure in AppWindow resize effect", () => {
  it("should use functional setState to avoid stale closure", () => {
    // Read the AppWindow source to check if functional setState is used
    const fs = require("fs");
    const path = require("path");
    const appWindowSource = fs.readFileSync(
      path.resolve(__dirname, "../components/AppWindow.tsx"),
      "utf-8"
    );

    // Check if the resize effect uses functional setState
    const hasStaleClosureBug = 
      appWindowSource.includes("setState({") &&
      appWindowSource.includes("...state,") &&
      appWindowSource.includes("width: Math.min(winWidth,") &&
      !appWindowSource.includes("setState(prev =>");

    // On unfixed code: this should be true (bug exists)
    // On fixed code: this should be false (bug fixed)
    expect(hasStaleClosureBug).toBe(false);
  });
});

/**
 * Test 1.2: Typo "innner-window" and wrong overflow class
 * **Validates: Requirements 1.2**
 * 
 * Bug: className has typo "innner-window" and uses "overflow-y-hidden"
 * Expected on unfixed code: Test FAILS - typo and wrong class found
 */
describe("Bug 1.2: Typo innner-window and wrong overflow class", () => {
  it("should have correct class name inner-window and overflow-y-auto", () => {
    const fs = require("fs");
    const path = require("path");
    const appWindowSource = fs.readFileSync(
      path.resolve(__dirnam