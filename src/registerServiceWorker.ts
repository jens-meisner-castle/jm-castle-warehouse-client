const postLoadServiceWorker = () => {
  console.log("register service-worker");
  const swUrl = new URL(
    `${window.location.protocol}//${window.location.host}/service-worker.js`
  );
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("New content is available; please refresh.");
              } else {
                console.log("Content is cached for offline use.");
              }
            }
          };
        }
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
};

export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", postLoadServiceWorker);
  }
};
