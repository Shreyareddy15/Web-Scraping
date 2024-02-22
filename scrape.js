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
    // Step 1: Directly initiate a search on Apartments.com
    await page.goto(`https://www.${searchString}/${cityName}`, { timeout: 60000 });

    // Step 2: Wait for the search results page to load
    await page.waitForSelector('.placardContainer', { timeout: 120000 });
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Step 3: Extract data for all homes with pagination
    const homeDataList = [];
    let hasNextPage = true;
    let pageNumber = 1;

    while (hasNextPage) {
      // Extract data using page.evaluate
      const currentPageData = await page.evaluate(() => {
        const homes = document.querySelectorAll('.placardContainer');

        return Array.from(homes).map(home => ({
          title: home.querySelector('.property-title')?.textContent.trim() || 'N/A',
          price: home.querySelector('.property-pricing')?.textContent.trim() || 'N/A',
          bedrooms: home.querySelector('.property-beds')?.textContent.trim() || 'N/A',
        }));
      });

      homeDataList.push(...currentPageData);

      hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector('.next'); 
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
      await new Promise(resolve => setTimeout(resolve, 2000));
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
