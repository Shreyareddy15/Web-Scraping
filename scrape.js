const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const searchAndScrapeHomes = async (searchString, cityName) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Step 1: Directly initiate a search on Google
    await page.goto(`https://www.google.com/search?q=${searchString}${cityName}`, { timeout: 60000 });

    // Step 2: Wait for the search results page to load
    await page.waitForSelector('a[href^="https://www.example-homes-website.com"]', { timeout: 60000 });

    // Step 3: Click on the link to the home listing website
    const homesLink = await page.$('a[href^="https://www.example-homes-website.com"]');
    await homesLink.click();
    await page.waitForNavigation();
    console.log("Clicked on the home listing link");

    // Step 4: Select a city
    await page.waitForSelector('.your-city-selector', { timeout: 60000 });
    const citySelector = '#quickSearchLookup'; // Replace with the actual selector for selecting a city
    
    await page.click(citySelector);
    console.log("Selected a city");

    // Step 5: Wait for the page to load after selecting a city
    await page.waitForNavigation();
    console.log("Page loaded after selecting a city");

    // Step 6: Extract data for all homes with pagination
    const homeDataList = [];
    let hasNextPage = true;
    let pageNumber = 1;

    while (hasNextPage) {
      const currentPageData = await page.evaluate(() => {
        const homes = document.querySelectorAll('h1'); // Replace with the actual selector for home listings

        return Array.from(homes).map(home => {
          return {
            price: home.querySelector('p')?.textContent.trim() || 'N/A',
            address: home.querySelector('p')?.textContent.trim() || 'N/A',
            bedrooms: home.querySelector('p')?.textContent.trim() || 'N/A',
            baths: home.querySelector('p')?.textContent.trim() || 'N/A',
            sqft: home.querySelector('p')?.textContent.trim() || 'N/A',
          };
        });
      });

      homeDataList.push(...currentPageData);

      hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector('.pagination .next'); // Replace with the actual selector for the next button
        if (nextButton) {
          nextButton.click();
          return true;
        }
        return false;
      });

      pageNumber++;

      // Optional: Add a check for a maximum number of pages to avoid infinite loops
      if (pageNumber > 5) {
        hasNextPage = false;
      }

      // Wait for a short time before navigating to the next page
      await page.waitForTimeout(2000);
    }

    return homeDataList;
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
  }
};

// API endpoint
app.post('/scrape-homes', async (req, res) => {
  const { searchString } = req.body;
  const { cityName } = req.body;

  if (!searchString) {
    return res.status(400).json({ error: 'Search string is required.' });
  }

  const homeDataList = await searchAndScrapeHomes(searchString, cityName);
  res.json({ data: homeDataList });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
