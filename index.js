const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();

app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome'
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-card')).map(el => ({
        name: el.querySelector('.product-card__title')?.innerText.trim(),
        price: el.querySelector('.price__lower-price')?.innerText.trim().replace(/[^\d]/g, ''),
        weight: el.querySelector('.product-card__description')?.innerText.trim(),
        brand: el.querySelector('.product-card__brand')?.innerText.trim(),
        shop: 'Ашан'
      }));
    });

    await browser.close();
    res.json({ products });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
