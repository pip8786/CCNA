function updateNicknames() {
  chrome.storage.sync.get("nicknames", (data) => {
    const nicknames = data["nicknames"] === undefined ? {} : data["nicknames"];
    const appendNickname = function () {
      $(this).find(".cc_nickname").remove();
      const matches = $(this).text().match(regex);
      let cardNumber = "0";
      if (matches && matches.length >= 2) {
        if (matches[1].length === 3) {
          cardNumber = matches[1].substr(1);
        } else {
          cardNumber = matches[1];
        }
      }
      const ccnum = CryptoJS.SHA256(cardNumber);
      if (nicknames[ccnum] !== undefined) {
        const node = $("<span class='cc_nickname'></span>").text(" - " + nicknames[ccnum]);
        $(this).append(node);
      }
    };

    msobservers.initialize(".pmts-instrument-number-tail", appendNickname);
    msobservers.initialize(".payment-row span.a-color-secondary", appendNickname);
    msobservers.initialize("#payment-information span.a-color-secondary", appendNickname);
    msobservers.initialize(".pmts-instrument-box span.a-color-secondary:not(.a-text-bold)", appendNickname);
    msobservers.initialize(".pmts-inst-tail", appendNickname);
    msobservers.initialize(".pmts-cc-number", appendNickname);
    msobservers.initialize(
      ".pmts-payments-instrument-detail-box-paystationpaymentmethod .a-color-base",
      appendNickname
    );
    msobservers.initialize("#payment-option-text-default span.break-word", appendNickname);
  });
}
