
const regex = /ending in\s*(\d{4})/;

let timer = null;


function updateNicknames() {
    chrome.storage.sync.get("nicknames", (data) => {
        const nicknames = data["nicknames"] == undefined ? {} : data["nicknames"];
        function appendNickname() {
            const ccnum = CryptoJS.SHA256($(this).text().match(regex)[1]);
            if(nicknames[ccnum] != undefined) {
                const node = $("<span class='cc_nickname'></span>").text(" - "+nicknames[ccnum]);
                $(this).append(node);
            }
        }

        $("#payment").off("DOMSubtreeModified");
        $(".cc_nickname").remove();
        $(".pmts-instrument-number-tail").each(appendNickname);
        $(".card-info span.a-color-secondary").each(appendNickname);
        $("#payment-information span.a-color-secondary").each(appendNickname);

        $("#payment").on("DOMSubtreeModified", ()=> {
            if (timer != null) {
                clearTimeout(timer);
            }
            timer = setTimeout(updateNicknames,250);
        });
    });
}

function getCardNumbers(type) {
    let cardNumbers = [];
    let selector = null;
    if (type == 1) {
        selector = $(".pmts-instrument-number-tail");
    } else if (type == 2) {
        selector = $(".card-info span.a-color-secondary");
    }
   selector.each(function(){
        cardNumbers.push($(this).text().match(regex)[1]);
    });

    chrome.runtime.sendMessage({
        action: "getCards",
        numbers: cardNumbers
    });
}

updateNicknames();