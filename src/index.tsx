import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import Desktop from "~/pages/Desktop";
import MobileDesktop from "~/pages/MobileDesktop";
import Login from "~/pages/Login";
import Boot from "~/pages/Boot";
import Hello from "~/pages/Hello";

import "@unocss/reset/tailwind.css";
import "uno.css";
import "katex/dist/katex.min.css";
import "~/styles/index.css";

export default function App() {
  const { winWidth } = useWindowSize();
  const [login, setLogin] = useState<boolean>(false);
  // On very first load, start with the Boot screen automatically
  const [booting, setBooting] = useState<boolean>(true);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [showHello, setShowHello] = useState<boolean>(false);
  const [restart, setRestart] = useState<boolean>(false);
  const [sleep, setSleep] = useState<boolean>(false);

  const shutMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(false);
    setLogin(false);
    setFirstLoad(false);
    setBooting(true);
  };

  const restartMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(true);
    setSleep(false);
    setLogin(false);
    setFirstLoad(false);
    setBooting(true);
  };

  const sleepMac = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRestart(false);
    setSleep(true);
    setLogin(false);
    setFirstLoad(false);
    setBooting(true);
  };

  // Called when Boot finishes loading
  const handleBootComplete = (value: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof value === "function" ? value(booting) : value;
    if (!resolved) {
      // Boot done — if it was the first load, go to Hello screen
      if (firstLoad) {
        setBooting(false);
        setShowHello(true);
      } else {
        setBooting(false);
      }
    } else {
      setBooting(resolved);
    }
  };

  if (showHello) {
    return (
      <Hello
        onComplete={() => {
          setShowHello(false);
          setFirstLoad(false);
        }}
      />
    );
  } else if (booting) {
    return (
      <Boot
        restart={restart}
        sleep={sleep}
        firstLoad={firstLoad}
        setBooting={handleBootComplete}
      />
    );
  } else if (login) {
    const DesktopComponent = winWidth < 640 ? MobileDesktop : Desktop;
    return (
      <DesktopComponent
        setLogin={setLogin}
        shutMac={shutMac}
        sleepMac={sleepMac}
        restartMac={restartMac}
      />
    );
  } else {
    return (
      <Login
        setLogin={setLogin}
        shutMac={shutMac}
        sleepMac={sleepMac}
        restartMac={restartMac}
      />
    );
  }
}


const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
