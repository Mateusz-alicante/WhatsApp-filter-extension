let passwordEnabled = true;

chrome.action.onClicked.addListener(async function (tab) {
  removeObjectFromLocalStorage("password");
  console.log("password reset");
});

/**
 * Removes Object from Chrome Local StorageArea.
 *
 * @param {string or array of string keys} keys
 */
const removeObjectFromLocalStorage = async function (keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(keys, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

chrome.tabs.onActivated.addListener((e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url == "https://web.whatsapp.com/" && passwordEnabled) {
      chrome.tabs.sendMessage(tabs[0].id, { reloadWhatsAppWindow: true });
    }
  });
});

chrome.contextMenus.create({
  id: "togglePassword",
  title: "Password Protection",
  contexts: ["action"],
  type: "checkbox",
  checked: true,
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == "togglePassword") {
    passwordEnabled = info.checked;
    console.log("passwordtoggle changes", info.checked);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.requestPasswordPref) {
    sendResponse({ passwordEnabled });
  }
});
