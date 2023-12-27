function getCurrentTabUrl(callback) {
  getCurrentTab((tab) => {
    if (tab) {
      callback(tab.url);
    }
  });
}

function getCurrentTab(callback) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, ([tab]) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    callback(tab);
  });
}

function renderStatus(statusText) {
  document.getElementById("status").textContent = statusText;
}

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action === "getCards") {
    if (request.numbers.length) {
      let nicknames = {};
      chrome.storage.sync.get("nicknames", (data) => {
        if (data["nicknames"] !== undefined) {
          nicknames = data["nicknames"];
        }
        renderStatus("Cards and nicknames:");
        request.numbers.forEach((item) => {
          const sItem = item;
          //If this is length 3, it could be a bank account.
          //On the checkout page, bank accounts are displayed with only 2 digits.
          //Store it with two digits instead.
          if (sItem.length === 3) {
            item = sItem.substr(1);
          }
          const ccHash = CryptoJS.SHA256(item);
          const oldValue = nicknames[ccHash] !== undefined ? nicknames[ccHash] : "";

          const input = $("<input type='text' id='card" + ccHash + "' placeholder='Nickname'/>");
          input.val(oldValue);
          let node = $("<div><span>" + sItem + "</span> </div>").append(input);
          input.keyup(() => {
            nicknames[ccHash] = input.val();
            chrome.storage.sync.set({ nicknames: nicknames }, () => {
              console.log("Saved nicknames.", nicknames);

              getCurrentTab((tab) => {
                chrome.scripting.executeScript({ target: { tabId: tab.id }, function: updateNicknames }).then(() => {
                  // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                  if (chrome.runtime.lastError) {
                    console.log("Error injecting script:", chrome.runtime.lastError.message);
                    //status.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
                  }
                });
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
const WALLET_REGEX = new RegExp(`${DOMAIN_REGEX.source}/gp/wallet`);
const CPE_WALLET_REGEX = new RegExp(`${DOMAIN_REGEX.source}/cpe/yourpayments/wallet`);
const BUY_REGEX = new RegExp(`${DOMAIN_REGEX.source}/gp/buy`);
const MANAGE_PAYMENT_REGEX = new RegExp(`${DOMAIN_REGEX.source}/cpe/managepaymentmethods`);
const REVISE_PAYMENT_REGEX = new RegExp(`${DOMAIN_REGEX.source}/cpe/revisepayments`);
const ASV_AUTO_REGEX = new RegExp(`${DOMAIN_REGEX.source}/asv/autoreload/`);
const ASV_REGEX = new RegExp(`${DOMAIN_REGEX.source}/asv/.*`);
const ORDER_DETAILS_REGEX = new RegExp(`${DOMAIN_REGEX.source}/gp/your-account/order-details.*`);

document.addEventListener("DOMContentLoaded", function () {
  getCurrentTabUrl(function (url) {
    let type = 0;

    if (WALLET_REGEX.test(url) || MANAGE_PAYMENT_REGEX.test(url) || CPE_WALLET_REGEX.test(url)) {
      type = 1;
    } else if (ASV_AUTO_REGEX.test(url)) {
      type = 4;
    } else if (BUY_REGEX.test(url) || REVISE_PAYMENT_REGEX.test(url)) {
      type = 2;
    } else if (ASV_REGEX.test(url)) {
      type = 3;
    } else if (ORDER_DETAILS_REGEX.test(url)) {
      type = 5;
    }
    if (type > 0) {
      renderStatus("This is an Amazon wallet tab.");
      getCurrentTab((tab) => {
        chrome.scripting
          .executeScript({ target: { tabId: tab.id }, function: getCardNumbers, args: [type] })
          .then(() => {
            // If you try and inject into an extensions page or the webstore/NTP you'll get an error
            if (chrome.runtime.lastError) {
              console.log("Error injecting script:", chrome.runtime.lastError.message);
              //status.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
            }
          });
      });
    } else {
      renderStatus("This is not an Amazon wallet or payment tab.");
    }
  });
});

function getCardNumbers(type) {
  let cardNumbers = [];
  let selector = null;
  if (type === 1) {
    selector = $(".pmts-instrument-number-tail:not(.a-size-base-plus)");
  } else if (type === 2) {
    selector = $(".pmts-cc-number");
  } else if (type === 3) {
    selector = $(".pmts-instrument-box span.a-color-secondary:not(.a-text-bold)");
  } else if (type === 4) {
    selector = $(".pmts-inst-tail");
  } else if (type === 5) {
    selector = $(".pmts-payments-instrument-detail-box-paystationpaymentmethod .a-color-base");
  }
  selector.each(function () {
    const matches = $(this).text().match(regex);
    if (matches && matches.length >= 2) {
      cardNumbers.push(matches[1]);
    }
  });

  chrome.runtime.sendMessage({
    action: "getCards",
    numbers: cardNumbers,
  });
}
