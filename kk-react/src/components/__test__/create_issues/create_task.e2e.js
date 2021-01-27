import puppeteer from 'puppeteer';
import { cookie, port } from '@tests/shared/data';

describe('create task', () => {

  test('could load successfully', async () => {
    let browser = await puppeteer.launch({
      headless: false,
      slowMo: 250
    });
    let page = await browser.newPage();

    await page.setCookie(...cookie); // 设置cookie

    await page.goto(`http://localhost:${port}/v2/manage/producttask/?productid=1&filterid=all`)

    await page.setViewport({ width: 1440, height: 789 })

    await page.waitForSelector('span > div > .f-jcsb-aic > div > .ant-btn')
    await page.click('span > div > .f-jcsb-aic > div > .ant-btn')

    await page.waitForSelector('.ant-modal > .ant-modal-content > .ant-modal-footer > div > .ant-btn:nth-child(2)')
    await page.click('.ant-modal > .ant-modal-content > .ant-modal-footer > div > .ant-btn:nth-child(2)')

    await browser.close()
  }, 9000000);
});
