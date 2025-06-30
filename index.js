import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Собираем все товары с нужными данными
    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('[data-link="product-card"]').forEach(card => {
        const name = card.querySelector('[data-link="text"]')?.innerText || '';
        const price = card.querySelector('[data-link="price"]')?.innerText || '';
        const weight = name.match(/\d+\s?[гг]/)?.[0] || '';
        items.push({ name, price, weight });
      });
      return items;
    });

    await browser.close();

    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
