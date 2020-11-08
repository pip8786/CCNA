
const regex = /.*?(\d{2,4})/;


// MutationSelectorObserver represents a selector and it's associated initialization callback.
const MutationSelectorObserver = function (selector, callback) {
    this.selector = selector;
    this.callback = callback;
};

// List of MutationSelectorObservers.
let msobservers = [];
msobservers.initialize = function (selector, callback) {

    // Wrap the callback so that we can ensure that it is only
    // called once per element.
    let seen = [];
    callbackOnce = function () {
        if (seen.indexOf(this) === -1) {
            seen.push(this);
            $(this).each(callback);
        }
    };

    // See if the selector matches any elements already on the page.
    $(selector).each(callbackOnce);

    //PS: for my purposes I can avoid adding it again if it's the same selector, no matter the callback.
    for (let i = 0; i < msobservers.length; i++) {
        if (msobservers[i].selector === selector) {
            return;
        }
    }

    // Then, add it to the list of selector observers.
    this.push(new MutationSelectorObserver(selector, callbackOnce));
};

// The MutationObserver watches for when new elements are added to the DOM.
const observer = new MutationObserver(function (mutations) {

    // For each MutationSelectorObserver currently registered.
    for (let j = 0; j < msobservers.length; j++) {
        $(msobservers[j].selector).each(msobservers[j].callback);
    }
});

// Observe the entire document.
observer.observe(document.documentElement, {childList: true, subtree: true, attributes: true});



function updateNicknames() {
    chrome.storage.sync.get("nicknames", (data) => {
        const nicknames = data["nicknames"] === undefined ? {} : data["nicknames"];
        const appendNickname = function() {
            $(this).find(".cc_nickname").remove();
            const matches = $(this).text().match(regex);
            let cardNumber = "0";
            if(matches && matches.length >= 2) {
                if(matches[1].length === 3) {
                    cardNumber = matches[1].substr(1);
                } else {
                    cardNumber = matches[1];
                }
            }
            const ccnum = CryptoJS.SHA256(cardNumber);
            if(nicknames[ccnum] !== undefined) {
                const node = $("<span class='cc_nickname'></span>").text(" - "+nicknames[ccnum]);
                $(this).append(node);
            }
        };

        msobservers.initialize(".pmts-instrument-number-tail", appendNickname);
        msobservers.initialize(".payment-row span.a-color-secondary", appendNickname);
        msobservers.initialize("#payment-information span.a-color-secondary", appendNickname);
        msobservers.initialize(".pmts-instrument-box span.a-color-secondary:not(.a-text-bold)", appendNickname);
        msobservers.initialize(".pmts-inst-tail", appendNickname);
        msobservers.initialize(".pmts-cc-number", appendNickname);
        msobservers.initialize(".a-row.a-spacing-mini span", appendNickname);
    });
}

function getCardNumbers(type) {
    let cardNumbers = [];
    let selector = null;
    if (type === 1) {
        selector = $(".pmts-instrument-number-tail");
    } else if (type === 2) {
        selector = $(".pmts-cc-number");
    } else if (type === 3) {
        selector = $(".pmts-instrument-box span.a-color-secondary:not(.a-text-bold)");
    } else if (type === 4) {
        selector = $(".pmts-inst-tail");
    } else if (type === 5) {
        selector = $(".a-row.a-spacing-mini span");
    }
   selector.each(function(){
       const matches = $(this).text().match(regex);
       if(matches && matches.length >= 2) {
           cardNumbers.push(matches[1]);
       }
    });

    chrome.runtime.sendMessage({
        action: "getCards",
        numbers: cardNumbers
    });
}

updateNicknames();
