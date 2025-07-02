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
    await page.waitForSelector('.product-card', { timeout: 10000 });

    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-card')).map(card => ({
        бренд: card.querySelector('.product-card__brand')?.innerText || '',
        позиция: card.querySelector('.product-card__title')?.innerText || '',
        вес: card.querySelector('.product-card__unit')?.innerText || '',
        цена: card.querySelector('.product-card__price-current')?.innerText || '',
        ссылка: card.querySelector('.product-card__title a')?.href || '',
      }));
    });

    await browser.close();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка парсинга');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
