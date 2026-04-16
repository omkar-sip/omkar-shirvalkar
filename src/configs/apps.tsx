import React, { lazy, Suspense } from "react";
import { appBarHeight } from "~/utils";
import type { AppsData } from "~/types";

// Lazy-load app components so they don't inflate the initial bundle.
// Each app is only fetched+parsed when the user first opens it.
const Bear = lazy(() => import("~/components/apps/Bear"));
const Typora = lazy(() => import("~/components/apps/Typora"));
const Safari = lazy(() => import("~/components/apps/Safari"));
const VSCode = lazy(() => import("~/components/apps/VSCode"));
const FaceTime = lazy(() => import("~/components/apps/FaceTime"));
const Terminal = lazy(() => import("~/components/apps/Terminal"));

const AppLoader = () => (
  <div className="flex-center size-full bg-c-100 text-c-500 text-sm">Loading…</div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<AppLoader />}>
    <Component />
  </Suspense>
);

const apps: AppsData[] = [
  {
    id: "launchpad",
    title: "Launchpad",
    desktop: false,
    img: "img/icons/launchpad.png"
  },
  {
    id: "bear",
    title: "Omkar Shirvalkar",
    desktop: true,
    width: 860,
    height: 500,
    show: true,
    y: -40,
    img: "img/icons/bear.png",
    content: withSuspense(Bear)
  },
  {
    id: "typora",
    title: "Typora",
    desktop: true,
    width: 600,
    height: 580,
    y: -20,
    img: "img/icons/typora.png",
    content: withSuspense(Typora)
  },
  {
    id: "safari",
    title: "Safari",
    desktop: true,
    width: 1024,
    minWidth: 375,
    minHeight: 200,
    x: -20,
    img: "img/icons/safari.png",
    content: withSuspense(Safari)
  },
  {
    id: "vscode",
    title: "VSCode",
    desktop: true,
    width: 900,
    height: 600,
    x: 80,
    y: -30,
    img: "img/icons/vscode.png",
    content: withSuspense(VSCode)
  },
  {
    id: "facetime",
    title: "FaceTime",
    desktop: true,
    img: "img/icons/facetime.png",
    width: 500 * 1.7,
    height: 500 + appBarHeight,
    minWidth: 350 * 1.7,
    minHeight: 350 + appBarHeight,
    aspectRatio: 1.7,
    x: -80,
    y: 20,
    content: withSuspense(FaceTime)
  },
  {
    id: "terminal",
    title: "Terminal",
    desktop: true,
    img: "img/icons/terminal.png",
    content: withSuspense(Terminal)
  },
  {
    id: "github",
    title: "Github",
    desktop: false,
    img: "img/icons/github.png",
    link: "https://github.com/omkar-sip"
  }
];

export default apps;
