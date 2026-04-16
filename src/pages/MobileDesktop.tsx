import React, { useState } from "react";
import { apps, wallpapers } from "~/configs";
import type { MacActions } from "~/types";
import TopBar from "~/components/menus/TopBar";
import Dock from "~/components/dock/Dock";
import MobileAppView from "~/components/MobileAppView";
import Launchpad from "~/components/Launchpad";
import Spotlight from "~/components/Spotlight";

interface MobileDesktopState {
  openAppId: string | null;
  currentTitle: string;
  showLaunchpad: boolean;
  spotlight: boolean;
}

export default function MobileDesktop(props: MacActions) {
  const [state, setState] = useState<MobileDesktopState>({
    openAppId: null,
    currentTitle: "Finder",
    showLaunchpad: false,
    spotlight: false
  });

  const [spotlightBtnRef, setSpotlightBtnRef] =
    useState<React.RefObject<HTMLDivElement> | null>(null);

  const { dark, brightness } = useStore((state) => ({
    dark: state.dark,
    brightness: state.brightness
  }));

  const toggleLaunchpad = (target: boolean): void => {
    const r = document.querySelector(`#launchpad`) as HTMLElement;
    if (r) {
      if (target) {
        r.style.transform = "scale(1)";
        r.style.transition = "ease-in 0.2s";
      } else {
        r.style.transform = "scale(1.1)";
        r.style.transition = "ease-out 0.2s";
      }
    }
    setState({ ...state, showLaunchpad: target });
  };

  const toggleSpotlight = (): void => {
    setState({ ...state, spotlight: !state.spotlight });
  };

  const openApp = (id: string): void => {
    if (id === "launchpad") {
      toggleLaunchpad(true);
      return;
    }

    const currentApp = apps.find((app) => app.id === id);
    if (!currentApp) {
      console.warn(`App ${id} not found`);
      return;
    }

    // Close launchpad if open
    if (state.showLaunchpad) {
      toggleLaunchpad(false);
    }

    setState({
      ...state,
      openAppId: id,
      currentTitle: currentApp.title
    });
  };

  const closeApp = (): void => {
    setState({
      ...state,
      openAppId: null,
      currentTitle: "Finder"
    });
  };

  const renderOpenApp = () => {
    if (!state.openAppId) return null;

    const app = apps.find((a) => a.id === state.openAppId);
    if (!app || !app.desktop) return null;

    return (
      <MobileAppView title={app.title} onClose={closeApp}>
        {app.content}
      </MobileAppView>
    );
  };

  return (
    <div
      className="size-full overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url(${dark ? wallpapers.night : wallpapers.day})`,
        filter: `brightness( ${(brightness as number) * 0.7 + 50}% )`
      }}
    >
      {/* Top Menu Bar */}
      <TopBar
        title={state.currentTitle}
        setLogin={props.setLogin}
        shutMac={props.shutMac}
        sleepMac={props.sleepMac}
        restartMac={props.restartMac}
        toggleSpotlight={toggleSpotlight}
        hide={false}
        setSpotlightBtnRef={setSpotlightBtnRef}
      />

      {/* Open App */}
      {renderOpenApp()}

      {/* Spotlight */}
      {state.spotlight && (
        <Spotlight
          openApp={openApp}
          toggleLaunchpad={toggleLaunchpad}
          toggleSpotlight={toggleSpotlight}
          btnRef={spotlightBtnRef as React.RefObject<HTMLDivElement>}
        />
      )}

      {/* Launchpad */}
      <Launchpad show={state.showLaunchpad} toggleLaunchpad={toggleLaunchpad} />

      {/* Dock */}
      <Dock
        open={openApp}
        showApps={{}}
        showLaunchpad={state.showLaunchpad}
        toggleLaunchpad={toggleLaunchpad}
        hide={state.openAppId !== null}
      />
    </div>
  );
}
