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

/**
 * Retrieve object from Chrome's Local StorageArea
 * @param {string} key
 */
const getObjectFromLocalStorage = async function (key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * Save Object in Chrome's Local StorageArea
 * @param {*} obj
 */
const saveObjectInLocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

let passwordEnabled = true;

saveObjectInLocalStorage({ passwordEnabled });

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

chrome.action.onClicked.addListener(async function (tab) {
  removeObjectFromLocalStorage("password");
  console.log("password reset");
});

chrome.tabs.onActivated.addListener((e) => {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0].url == "https://web.whatsapp.com/") {
      console.log("WhatsApp tab activated", passwordEnabled);
    }
    if (tabs[0].url == "https://web.whatsapp.com/" && passwordEnabled) {
      while (true) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, { reloadWhatsAppWindow: true });
          return;
        } catch (e) {
          console.log("delaying message");
          await delay(1000);
        }
      }
    }
  });
});

try {
  chrome.contextMenus.create({
    id: "togglePassword",
    title: "Password Protection",
    contexts: ["action"],
    type: "checkbox",
    checked: true,
  });
  chrome.contextMenus.create({
    id: "resetFormProgress",
    title: "Reset form progress",
    contexts: ["action"],
  });
  chrome.contextMenus.create({
    id: "resetPassword",
    title: "Reset password",
    contexts: ["action"],
  });
} catch (e) {
  console.log(e);
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == "togglePassword") {
    passwordEnabled = info.checked;
    saveObjectInLocalStorage({ passwordEnabled });
    console.log("passwordtoggle changes", info.checked);
  }
  if (info.menuItemId == "resetFormProgress") {
    removeObjectFromLocalStorage("progressStats");
  }
  if (info.menuItemId == "resetPassword") {
    removeObjectFromLocalStorage("password");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.requestPasswordPref) {
    sendResponse({ passwordEnabled });
  }
});

console.log("background.js loaded");
