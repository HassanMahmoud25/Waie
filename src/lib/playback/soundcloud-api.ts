/**
 * The slice of SoundCloud's official HTML5 Widget API the SoundCloud audio
 * surface uses to read/seek the embedded track's position -- the same kind
 * of small, sanctioned per-page script as youtube-api.ts's IFrame Player API,
 * loaded only when a SoundCloud-sourced episode is actually shown. No OAuth,
 * no client id: it talks to an iframe already on the page via postMessage.
 * Docs: https://developers.soundcloud.com/docs/api/html5-widget
 */
export type SCWidget = {
  bind: (eventName: string, listener: (data: { currentPosition: number }) => void) => void;
  unbind: (eventName: string) => void;
  seekTo: (milliseconds: number) => void;
  getPosition: (callback: (milliseconds: number) => void) => void;
};

type SCNamespace = {
  Widget: {
    (iframe: HTMLIFrameElement): SCWidget;
    Events: {
      READY: string;
      PLAY_PROGRESS: string;
      PAUSE: string;
      FINISH: string;
    };
  };
};

declare global {
  interface Window {
    SC?: SCNamespace;
  }
}

let apiPromise: Promise<SCNamespace> | null = null;

/** Loads SoundCloud's Widget API script once per page. */
export function loadSoundCloudWidgetApi(): Promise<SCNamespace> {
  if (window.SC?.Widget) return Promise.resolve(window.SC);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.onload = () => resolve(window.SC!);
    document.head.appendChild(script);
  });
  return apiPromise;
}
