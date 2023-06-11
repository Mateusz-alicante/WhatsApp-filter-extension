const env = {
  BACKEDN_URL: "http://localhost:3000/",
};

let foundMessages = false;

const rootApp = document.getElementById("app");

// Override default remove function to prevent Ract errors
const ovveride = () => {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("scripts/override.js");
  s.onload = function () {
    this.remove();
  };
  // see also "Dynamic values in the injected code" section in this answer
  (document.head || document.documentElement).appendChild(s);
};
ovveride();

// This function will take in a blob from the WhatsappWeb service and return a base64 encoded string
function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// testing utility function
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// utility function to convert html to element
function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

const addWarningMessage = (element) => {
  const content = element.getElementsByClassName("_1BOF7 _2AOIt")[0];
  content.style.opacity = 100;
  content.style.display = "none";
  const warningMessage = document.createElement("div");
  warningMessage.classList.add("warning-message");
  warningMessage.appendChild(
    htmlToElement(
      "<p>This message may be unsafe. Click the button below to reveal it anyway.</p>"
    )
  );
  const button = document.createElement("button");
  button.innerHTML = "Reveal";
  button.onclick = () => {
    content.style.display = "inline";
    warningMessage.remove();
  };
  warningMessage.appendChild(button);
  content.parentElement.appendChild(warningMessage);
};

const setLoading = (element) => {
  // if the element already has other style classes, modify their content, without creating new ones
  if (element.getElementsByClassName("safe-checker-alert-generic")[0]) {
    // set the correct style for the border
    element.classList.remove("checked-color");
    element.classList.remove("unknown-color");
    element.classList.add("checking-color");

    // Change the message banner to loading, and remove any possible previous states
    const loading = element.getElementsByClassName(
      "safe-checker-alert-generic"
    )[0];
    loading.classList.remove("safe-checker-alert-ok");
    loading.classList.remove("safe-checker-alert-unknown");
    loading.classList.add("safe-checker-alert-checking");
    loading.getElementsByTagName("p")[0].innerHTML = "Checking...";

    // set opacity to zero
    const content = element.getElementsByClassName("_1BOF7 _2AOIt")[0];
    content.style.opacity = 0;

    // remove any possible previous status icons, and replace with the loader
    const status =
      loading.getElementsByClassName("tick-mark-class")[0] ||
      loading.getElementsByClassName("warning-sign")[0];
    if (status) status.remove();
    loading.appendChild(
      htmlToElement(
        '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>'
      )
    );
    return;
  }

  // Otherwise, if the necessary containers have not been created, create them

  // remove message tail if it is present
  const tail = element.querySelector('[data-testid="tail-in"]');
  tail ? tail.remove() : null;

  // set opacity to zero
  const content = element.getElementsByClassName("_1BOF7 _2AOIt")[0];
  content.style.opacity = 0;

  // Create an outer continer that contains the message banner and append it to the outer message container
  const outerDiv = document.createElement("div");
  outerDiv.classList.add(
    "safe-checker-alert-generic",
    "safe-checker-alert-checking"
  );
  const loadingText = document.createElement("p");
  loadingText.appendChild(document.createTextNode("Checking..."));
  outerDiv.appendChild(loadingText);
  outerDiv.appendChild(
    htmlToElement(
      '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>'
    )
  );
  element.insertBefore(outerDiv, element.firstChild);

  // Add the relevant style classes to the message container
  element.classList.add("checking-color");
};

const setOK = (element) => {
  element.classList.remove("checking-color");
  element.classList.remove("unknown-color");
  element.classList.add("checked-color");

  // set opacity to full
  const content = element.getElementsByClassName("_1BOF7 _2AOIt")[0];
  content.style.opacity = 100;

  // remove loading
  const loading = element.getElementsByClassName(
    "safe-checker-alert-generic"
  )[0];
  loading.classList.remove("safe-checker-alert-checking");
  loading.classList.remove("safe-checker-alert-unknown");
  loading.classList.add("safe-checker-alert-ok");
  loading.getElementsByTagName("p")[0].innerHTML = "Safe";
  const loader =
    loading.getElementsByClassName("lds-ring")[0] ||
    loading.getElementsByClassName("warning-sign")[0];
  if (loader) loader.remove();
  loading.appendChild(
    htmlToElement('<div class="tick-mark-class" id="tick-mark"></div>')
  );
};

const setUnsafe = (element, level) => {
  element.classList.remove("checking-color");
  element.classList.add(level <= 1 ? "warning-color" : "unsafe-color");

  // remove loading
  const loading = element.getElementsByClassName(
    "safe-checker-alert-checking"
  )[0];
  loading.classList.remove("safe-checker-alert-checking");
  loading.classList.add(
    level <= 1 ? "safe-checker-alert-warning" : "safe-checker-alert-unsafe"
  );
  loading.getElementsByTagName("p")[0].innerHTML =
    level <= 1 ? "could be unsafe" : "Unsafe";
  const loader = loading.getElementsByClassName("lds-ring")[0];
  loader.remove();
  loading.appendChild(
    htmlToElement(
      level <= 1
        ? '<span class="warning-sign" >&#63;</span>'
        : '<span class="cross-sign">&#9760;</span>'
    )
  );

  addWarningMessage(element);
};

const setToUnkown = (element) => {
  element.classList.remove("checking-color");
  element.classList.add("unknown-color");

  const content = element.getElementsByClassName("_1BOF7 _2AOIt")[0];
  content.style.opacity = 100;

  const loading = element.getElementsByClassName(
    "safe-checker-alert-checking"
  )[0];
  loading.classList.remove("safe-checker-alert-checking");
  loading.classList.add("safe-checker-alert-unknown");
  loading.getElementsByTagName("p")[0].innerHTML = "Could not check";
  const loader = loading.getElementsByClassName("lds-ring")[0];
  loader.remove();
  loading.appendChild(
    htmlToElement('<span class="warning-sign" >&#63;</span>')
  );
};

const registerImage = async (element) => {
  // Select the HTML element containing the image. This is useful for setting the style states of the message
  const imageElement = element.getElementsByClassName(
    "lhggkp7q jnl3jror p357zi0d gndfcl4n ac2vgrno ln8gz9je ppled2lx"
  )[1];

  // Mark the message as checked
  element.classList.add("image_safe_checked");

  // Get the image source
  const imageSrc = imageElement.children[0].src;

  // Fetch the image and convert it to Base64 before sending the the API
  const response = await fetch(imageSrc);
  const blob = await response.blob();
  const base = await blobToBase64(blob);
  const image = base;

  // If there exists a text container, get the text and add it to the request.
  let text = undefined;
  const textContainer = element.getElementsByClassName(
    "_11JPr selectable-text copyable-text"
  )[0];
  if (textContainer) {
    text = textContainer.children[0].innerHTML;
  }

  // check the safery of the image and the text if it exists
  checkSafety(text, image, element);
};

const registerMessage = async (element) => {
  const textContainer = element.getElementsByClassName(
    "_11JPr selectable-text copyable-text"
  )[0];
  const text = textContainer.children[0].innerHTML;
  checkSafety(text, null, element);
};

const checkSafety = async (text, image, element) => {
  // This function will send a request to the backend to check the safety of the message

  // select the message container of the current message. Styles will be added to this contianer
  const messageContaier = element.querySelector(
    '[data-testid="msg-container"]'
  );

  // Set the message style to loading
  setLoading(messageContaier);

  try {
    // send a request to the API to check the safety of the content
    const res = await fetch(env.BACKEDN_URL, {
      method: "POST",
      body: JSON.stringify({ text, image }),
      headers: new Headers({ "content-type": "application/json" }),
    });
    const data = await res.json();

    if (res.status == 200) {
      // Get the maximum unsafe warning number
      const maxWarning = Math.max(
        data.unsafeURL,
        data.unsafeText,
        data.unsafeImage,
        data.spam
      );

      // depending of hwo unsafe the message is, set its style accordingly.
      if (maxWarning == 0) {
        setOK(messageContaier);
      } else if (maxWarning == 1) {
        setToUnkown(messageContaier, maxWarning);
      } else if (maxWarning == 2) {
        setUnsafe(messageContaier, 1);
      } else if (maxWarning == 3) {
        setUnsafe(messageContaier, 2);
      }
    } else {
      setToUnkown(messageContaier);
    }
  } catch {
    // If the request fails, set the message style to unkown
    setToUnkown(messageContaier);
  }
};

const handleImage = (element) => {
  // The purpose of this image is to keep track of when the image is fully laoded, and when a low-res preview is loaded

  // Select the clickable image element
  const ImageContainer = element.querySelector('[role="button"]');

  // set the message style to unkown
  const messageContaier = element.querySelector(
    '[data-testid="msg-container"]'
  );
  // Do this first, as it creates the neccesary additioanl elements and containers.
  setLoading(messageContaier);
  setToUnkown(messageContaier);

  // Construct the observer function
  const updateImage = () => {
    if (element.querySelector('[data-testid="media-url-provider"]')) {
      // if the image is fully loaded, run the function to check the safety of the image
      registerImage(element);

      // disconnect the observer. Once the image is checked the job is done
      ImageObserver.disconnect();
    }
  };

  // Observe the image element for changes
  const ImageObserver = new MutationObserver(updateImage);
  ImageObserver.observe(ImageContainer, { childList: true, subtree: true });
  updateImage();
};

const MessageChangeObserver = new MutationObserver(() => {
  // select the main container for the messages
  const messageContainer = document.querySelector('[role="application"]');

  // iterate over all the messages in the container
  Array.from(messageContainer.children)
    .reverse()
    .forEach((element) => {
      if (
        // This will check that the message has not yet been checked, and that the message is incoming (not outgoing)
        !element.classList.contains("safe_checked") &&
        element.children[0].children[0]?.classList.contains("message-in")
      ) {
        // mark the message as checked
        element.classList.add("safe_checked");

        // If is of one of the following types, do not check it (these messages do not contain information that could be mallicioius)

        // If the message has been deleted
        if (element.querySelector('[data-icon="recalled"]')) return;

        // If the messsage is marked as view once and has not yet been viewed
        if (element.querySelector('[data-testid="view-once-viewed"]')) return;

        // If the messsage is marked as view once, and has been viewed already
        if (element.querySelector('[data-testid="view-once-sunset"]')) return;

        // Check if the message only contains plain text by looking for relevant classes
        const plainTextMessage =
          element.getElementsByClassName("UzMP7 _1uv-a _3m5cz")[0] ||
          element.getElementsByClassName("UzMP7 _1uv-a")[0];

        // If the message only contains plain text, use the registerMessage() function
        if (plainTextMessage) {
          registerMessage(element);
        }

        // Check if the message contains boh and text and image
        const textAndImageMessage =
          element.getElementsByClassName("UzMP7 _27hEJ _3m5cz")[0] ||
          element.getElementsByClassName("UzMP7 _27hEJ")[0];

        // Run relevant functions for the message type
        if (textAndImageMessage) {
          console.log("found messge with image and text");
          handleImage(element);
        }

        // Check if the message contains only an image
        // const imageMessage = element.
      }
    });
});

const ChatChangeObserver = new MutationObserver(() => {
  // Here we will observe the chat list container (on the left), and the message container (on the right) for a specifc chat
  // We want to check new messages for safety in both of these cases
  const chatContainer = document.querySelector('[data-testid="chat-list"]');
  const messageContaier = document.querySelector('[role="application"]');

  // This will run not only when a new chat is selected, but also when the user hovers over different chats,
  // === Feature missing: Only check when a new chat is actually selected ===
  MessageChangeObserver.observe(chatContainer, {
    childList: true,
    subtree: true,
  });

  MessageChangeObserver.observe(messageContaier, {
    childList: true,
    subtree: false,
  });
});

// create a new instance of `MutationObserver` named `observer`,
// passing it a callback function
const RootObserver = new MutationObserver(() => {
  // First, we check if the message container is present in the website, and if that we have not already called the objective function
  if (rootApp.children[0].classList.contains("_1h2dM") && !foundMessages) {
    // If the message header is present, the messages in a specific chat are loaded
    const messageHeader = document.getElementsByClassName("_2Ts6i _2xAQV")[1];
    if (messageHeader) {
      // only run this onece per chat
      foundMessages = true;

      // observe the specifc chat container for changes
      ChatChangeObserver.observe(messageHeader, {
        childList: true,
        subtree: false,
      });
    }
  }
});

// call `observe()` on that MutationObserver instance,
// passing it the element to observe, and the options object
RootObserver.observe(rootApp, { subtree: true, childList: true });
