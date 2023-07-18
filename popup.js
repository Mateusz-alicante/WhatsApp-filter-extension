let endpointForm = document.getElementById("changeEndpoint");

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

endpointForm.onsubmit = async (e) => {
  e.preventDefault();
  const enabled = await getObjectFromLocalStorage("passwordEnabled");
  console.log(enabled);
  let newEndpoint = document.getElementById("endpointInput").value;
  console.log("endpoint changed", newEndpoint);
  saveObjectInLocalStorage({ APIENDPOINT: newEndpoint });
  endpointForm.appendChild(document.createTextNode("Endpoint changed!"));
};
