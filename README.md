# CCNA
Credit Card Nicknames for Amazon Chrome Extension

# Description
This is a small extension built after getting frustrated with the fact that Amazon doesn't allow you to give nicknames to your credit cards. It will sync them across your google account.

# Install
The extension can be found here: [Chrome Webstore](https://chrome.google.com/webstore/detail/credit-card-nicknames-for/iodihdkgnjbpkdimohmpgbcfoioebbnf "Credit Card Nicknames for Amazon Chrome Extension")

# Security
The extension does not store the 4 digit numbers of the credit card, instead using a hash to associate the nickname with the card number.

# Releases

## 1.0.8 (Nov 8th, 2020)
- Fixed [#12](../../issues/12) - Add the nickname to the order details page.

## 1.0.7 (Aug 20th, 2020)
- Fixed [#11](../../issues/11) - Bank account nicknames don't show on checkout page
- Updated some jQuery selectors to more accurately match all account types.

## 1.0.6 (Apr 23rd, 2020)
- Fixed some issues with the URLs on non .com sites.
- Updated some jQuery selectors to match the new CSS from Amazon.

## 1.0.5 (Jan 20th, 2019)
- Fixed an issue with finding CCs on non english sites.

## 1.0.4 (Dec 25th, 2018)
- Fixed [#10](../../issues/10) - Support Reload Your Balance page
- Added support for checking accounts
- Made the script and popup more robust so hopefully fixes some issues people had with it showing at all.

## 1.0.3 (Feb 3rd, 2018)
- Fixed [#4](../../issues/4) - Payment options on amazon location changed, needed update in code
- Fixed [#5](../../issues/5) - Added smile support
- Fixed [#6](../../issues/6) - Added support for all domains supported by amazon

## 1.0.2 (Jan 8th, 2017)
- Fixed [#2](../../issues/2) - Icons and banner images.
- Fixed [#3](../../issues/3) - More reliable insertion of the nicknames into the DOM.

## 1.0.1 (Jan 1st, 2017)
- Fixed [#1](../../issues/1) - Special characters in nicknames are now properly encoded.

## 1.0 (Dec 28th, 2016)
- Initial release.
