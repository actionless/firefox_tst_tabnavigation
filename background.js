/*jshint esversion: 6 */
(async function () {
    "use strict";

    const TST_ID = "treestyletab@piro.sakura.ne.jp";

    const EXT_NAME = "TST-KeyNav";
    const EXT_CLASS = "tst-keynav";

    const init = async () => {
        console.log(`Loading ${EXT_NAME}...`);
        await registerToTST();
        await handleTabNumbersVisibility({toggle: false});
        browser.commands.onCommand.addListener(async (command) => {
            if (command === "toggle-keynavigation") {
                await handleTabNumbersVisibility({toggle: true});
            }
        });
        console.log(`Loaded ${EXT_NAME}.`);
    };

    const handleTabNumbersVisibility = async (kwargs) => {
        const STATUS_STORAGE = "tst-tabnumber";
        let lastStatus = (await browser.storage.local.get(STATUS_STORAGE))[STATUS_STORAGE];
        if (kwargs.toggle) lastStatus = !lastStatus;

        const tabs = await browser.tabs.query({currentWindow: true});
        const tabIds = tabs.map((t) => t.id);

        if (lastStatus) {
            browser.runtime.sendMessage(TST_ID, {
                type:  "add-tab-state",
                tabs:  tabIds, // required, an array of tabs.Tab.id or alias
                state: EXT_CLASS // required, a state string or an array of state strings
            });
        } else {
            browser.runtime.sendMessage(TST_ID, {
                type:  "remove-tab-state",
                tabs:  tabIds, // required, an array of tabs.Tab.id or alias
                state: EXT_CLASS // required, a state string or an array of state strings
            });
        }

        const result = {};
        result[STATUS_STORAGE] = lastStatus;
        browser.storage.local.set(result);
    };

    const registerToTST = async () => {
        try {
            const result = await browser.runtime.sendMessage(TST_ID, {
                type: "register-self",
                // The name of your addon (string, optional)
                name: EXT_NAME,
                // Icons (used for extra context menu items, works on TST 2.4.18 and later)
                icons: browser.runtime.getManifest().icons, // { '16': '/path/to/icon.png', 24: '...', ... }
                // The list of listening message types (array of string)
                //listeningTypes: ["tab-mousedown", "tab-mouseup"],
                listeningTypes: [],
                // Extra style rules applied in the sidebar (string, optional)
                style: `

#tabbar:has(.${EXT_CLASS}) {
    counter-reset: vtabs atabs tabs;
    /* vtabs tracks visible tabs, atabs tracks active tabs, tabs tracks all tabs */
}
tab-item.${EXT_CLASS}:not(.collapsed):not(.discarded) {
    counter-increment: vtabs atabs tabs;
}
tab-item.${EXT_CLASS}:not(.collapsed) {
    counter-increment: vtabs tabs;
}
tab-item.${EXT_CLASS}:not(.discarded) {
    counter-increment: atabs tabs;
}
tab-item.${EXT_CLASS} {
    counter-increment: tabs;
}

tab-item.${EXT_CLASS} .extra-items-container {
    z-index: unset !important;
}
tab-item.${EXT_CLASS}::before {
    background: Highlight;
    color: HighlightText;
    content: counter(tabs);
    font-size: x-small;
    left: 0.2em;
    padding: 0.2em;
    pointer-events: none;
    position: absolute;
    z-index: 1000;
    z-index: 1000000;
    opacity: 0.8;
    top:0.2em;
}
tab-item.${EXT_CLASS} tab-twisty {
    top: 0.3em;
}

    `,
                // Extra permissions to receive tab information via TST's API (works on TST 3.0.12 and later)
                permissions: ["tabs"]
            });
            console.log("Registered in Tree Style Tab:");
            console.log(result);
        }
        catch(e) {
            console.log("Tree Style Tab is not available:");
            console.log(e);
        }
    };

    return await init();
}());
