"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scrape.ts
const puppeteer_1 = require("puppeteer");
const scrapeZillow = (city) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    // Navigate to Zillow's search page
    yield page.goto(`https://www.zillow.com/homes/${city}_rb/`);
    // Your scraping logic
    let hasNextPage = true;
    const listings = [];
    while (hasNextPage) {
        const newlistings = yield page.evaluate(() => {
            const data = [];
            // Extract data from the page
            const prices = Array.from(document.querySelectorAll('.list-card-price'));
            const addresses = Array.from(document.querySelectorAll('.list-card-addr'));
            // Combine data into an array of objects
            prices.forEach((price, index) => {
                var _a, _b, _c;
                const listing = {
                    price: ((_a = price.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || 'N/A',
                    address: ((_c = (_b = addresses[index]) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || 'N/A',
                };
                data.push(listing);
            });
            return data;
        });
        // Concatenate new listings to the existing list
        listings.push(...newlistings);
        // Click on the next page button
        const nextButton = yield page.$('.zsg-pagination-next');
        if (nextButton) {
            yield nextButton.click();
            yield page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        }
        else {
            hasNextPage = false;
        }
    }
    yield browser.close();
    return listings;
});
exports.default = scrapeZillow;
