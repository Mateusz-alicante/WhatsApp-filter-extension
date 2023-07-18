# WhatsApp web security filter chrome extension

## Installation

The extension can be installed in Google Chrome Web Store

In order to install the source code of the extension you will need to:

1. clone this repository to your computer. Open your command prompt or terminal, and navigate to the folder where you would like to install the extension. Once there (make sure you have git), run:

```console
git clone https://github.com/Mateusz-alicante/WhatsApp-filter-extension.git
```

2. Enable developer tools in the chrome extension window (chrome://extensions/) and load the unpacked extension.
   You may want to follow [this YouTube vide](https://youtu.be/oswjtLwCUqg) for more detailed instructions. Simply select the folder cloned from GitHub and the extension should load.

3. Enjoy a more secure WhatsApp experience!

## Usage

### Safety feedback on messages

Once the extension is installed and enabled, once you open WhatsApp the extension will begin to scan messages for safety. There are 4 possible basic states for a message (plus one which indicates the message could not be checked due to a server error):
![basic message states](https://raw.githubusercontent.com/Mateusz-alicante/guide-pictures/main/Screenshot%202023-06-11%20at%2020.49.33.png)

While the messages are being checked for safety, they will be hidden, so as to prevent displaying any malitious content.

For now, the extensions supports text messages, as well as Images. Everything that is not supported by the extension will be left as is (without any style changes).

### Password system

The extension also implements a password protection system. The first time WhatsApp is opened, a prompt will appear asking the user for a password. The password must meet the following requirements:

- Have a minimum length of 12 characters
- Have at least 3-character classes (out of: uppercase, lowercase, digit, special character)

The prompt for the creation of the password in the user interface has the following appeareance:
![Password creation UI](https://raw.githubusercontent.com/Mateusz-alicante/guide-pictures/main/Screenshot%202023-06-21%20at%2016.26.13.png)

Each subsequent time the user opens the WhatsApp web window, he will be prompted for the password.

If the password is forgotten, it can be changed by clicking on the extension icon in the chrome extension list.

If the user desired to disable the password protection feature, he can do so in the settings page for the extension (Accessed through the chrome extension list).

## Future work

The main speed limitation for now is the fact that the free Azure Content Moderator only allows 1 call per second. In order to imporve the speed of the application despite this limitation, the following aspects will be worked on:

- Imporving the server scheduling system by reducing the number of unecessary messages being checked (For example when a user moves to a new chat, clear all of the messages from the previous chat from thr queue).

Another aspect on which future work can focus is the support for a highier number of message types, like

- Image galleries.
- Videos
- Audio messages

These new types of messages may be very challenging, if not impossible to implement, as most often videos and image galleries are loaded onto the browser when the user opens them, which means that they are simply not available for the extension to see before the user clicks them.

It will be important to moving the backend server from vanilla node with express to a Next.js server. All free tiers for hosting vanilla node applications put the server to sleep after a time of inactivity. This means that very often when a user is trying to make calls to the API, the server has to wake up, which may take some time. With Next.js, serverless functions allow the server to be constanty available and waiting for calls, even in free tiers!

## Next stage of the research

After fixing any initials bugs with both the extension and the backend server, I will move to the second stage of the research, which will consist in measuring how accurate the filter can be, as well as possibly training my own models which may prove to be more effective or appropiate for this specific use case.
