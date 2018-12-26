// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    const queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        const tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        const url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url === 'string', 'tab.url should be a string');

        callback(url);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function renderStatus(statusText) {
    document.getElementById('status').textContent = statusText;
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === "getCards") {
        if (request.numbers.length) {
            let nicknames = {};
            chrome.storage.sync.get("nicknames", (data) => {
                if(data["nicknames"] !== undefined) {
                    nicknames = data["nicknames"];
                }
                renderStatus("Cards and nicknames:");
                request.numbers.forEach((item) => {
                    const ccHash = CryptoJS.SHA256(item);
                    const oldValue = (nicknames[ccHash] !== undefined) ? nicknames[ccHash] : "";
                    const input = $("<input type='text' id='card"+ccHash+"' placeholder='Nickname'/>");
                    input.val(oldValue);
                    let node = $("<div><span>"+item+"</span> </div>").append(input);
                    input.keyup(()=>{
                        nicknames[ccHash] = input.val();
                       chrome.storage.sync.set({"nicknames": nicknames}, () => {
                           console.log("Saved nicknames.");
                           chrome.tabs.executeScript(null, {
                               code: "updateNicknames();"
                           }, function() {
                               // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                               if (chrome.runtime.lastError) {
                                   message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                               }
                           });
                       });
                    });
                    $("#cardNicknames").append(node);
                });
                $("#cardNicknames").show();
            });

        } else {
            renderStatus("No cards found on the page.");
        }
    }
});

const DOMAIN_REGEX = /^https:\/\/(smile|www)\.amazon\.[a-zA-Z.]{2,6}/;
const WALLET_REGEX = new RegExp(`${ DOMAIN_REGEX.source }/gp/wallet`);
const BUY_REGEX = new RegExp(`${ DOMAIN_REGEX.source }/gp/buy`);
const PAYMENT_REGEX = new RegExp(`${ DOMAIN_REGEX.source }/cpe/managepaymentmethods`);
const ASV_AUTO_REGEX = new RegExp(`${ DOMAIN_REGEX.source }/asv/autoreload/`);
const ASV_REGEX = new RegExp(`${ DOMAIN_REGEX.source }/asv/.*`);

document.addEventListener('DOMContentLoaded', function () {
    getCurrentTabUrl(function (url) {
        let type = 0;

        if (WALLET_REGEX.test(url) || PAYMENT_REGEX.test(url)) {
            type = 1;
        } else if (BUY_REGEX.test(url)) {
            type = 2;
        } else if (ASV_AUTO_REGEX.test(url)) {
            type = 4;
        } else if (ASV_REGEX.test(url)) {
            type = 3;
        }

        if (type > 0) {
            renderStatus("This is an amazon wallet tab.");
            chrome.tabs.executeScript(null, {
                code: "getCardNumbers("+type+");"
            }, function() {
                // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                if (chrome.runtime.lastError) {
                    message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                }
            });
        } else {
            renderStatus("This is not an amazon wallet or payment tab.");
        }
    });
});


