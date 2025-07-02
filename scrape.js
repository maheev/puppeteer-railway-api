const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/scrape', async (req, res) => {
  const searchQuery = req.query.q || 'майонез';

  const url = `https://www.auchan.ru/catalog/?q=${encodeURIComponent(searchQuery)}`;
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Ждём, пока отрисуются товары
   await page.waitForSelector('.catalog-product', { timeout: 10000 });

return Array.from(document.querySelectorAll('.catalog-product')).map(card => ({
  бренд: card.querySelector('.catalog-product_brand')?.innerText || '',
  позиция: card.querySelector('.catalog-product_title')?.innerText || '',
  цена: card.querySelector('.catalog-product_price')?.innerText || '',
  // и т.д.
}));

    await browser.close();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка парсинга');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
