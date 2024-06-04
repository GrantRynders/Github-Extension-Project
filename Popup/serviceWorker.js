const extensions = 'https://developer.chrome.com/docs/extensions'
const webstore = 'https://developer.chrome.com/docs/webstore'
chrome.scripting.executeScript(
    {
        files: ['extension.js']
    }
);
// .registerContentScripts([{
//     id: "session-script",
//     js: ["extension.js"],
//     persistAcrossSessions: false,
//     matches: ["https://github.com/*/issues/*"],
//     runAt: "document_start",
//   }])
//   .then(() => console.log("registration complete"))
//   .catch((err) => console.warn("unexpected error", err));