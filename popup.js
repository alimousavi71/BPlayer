let playerInit;
window.addEventListener("DOMContentLoaded", () => {
     chrome.tabs.query(
          {
               active: true,
               currentWindow: true,
          },
          (tabs) => {
               // ...and send a request for the DOM info...
               chrome.tabs.sendMessage(
                    tabs[0].id,
                    { from: "popup", subject: "DOMInfo" },
                    playerInit
               );
          }
     );
});
