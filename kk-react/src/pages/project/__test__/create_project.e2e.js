import puppeteer from 'puppeteer';
import { cookie, port } from '@tests/shared/data';

describe('loading project', () => {
  test('create page should loading successfully', async () => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.setCookie(...cookie); // 设置cookie

    await page.goto(`http://localhost:${port}/v2/project/create_project`);

    await page.waitForSelector('div');
    await page.$('.input');
    browser.close();
  }, 56000);
});

describe('create project', () => {
  test('project should be successfully create and go to detail page', async () => {
    let browser = await puppeteer.launch({
      headless: false,
      slowMo: 250,
    });

    let page = await browser.newPage();

    await page.setViewport({ width: 1440, height: 789 });

    await page.setCookie(...cookie); // 设置cookie

    await page.goto(`http://localhost:${port}/v2/project/create_project`);

    await page.waitForSelector('.ant-card-body');
    await page.click("input[id=title]");
    await page.type("input[id=title]", '这是个自动化测试项目');
    await page.click(".ant-select-selection");

    await page.waitForSelector('.ant-form-item-control > .ant-form-item-children > #productIds > .ant-select-selection > .ant-select-selection__rendered');
    await page.click('.ant-form-item-control > .ant-form-item-children > #productIds > .ant-select-selection > .ant-select-selection__rendered');

    await page.waitForSelector('#productIds-74');
    await page.click('#productIds-74');

    await page.waitForSelector('.ant-form-item-control > .ant-form-item-children > #subProductId > .ant-select-selection > .ant-select-selection__rendered');
    await page.click('.ant-form-item-control > .ant-form-item-children > #subProductId > .ant-select-selection > .ant-select-selection__rendered');

    await page.waitForSelector('#subProductId-46');
    await page.click('#subProductId-46');

    await page.waitForSelector('#next');
    await page.click("#next");

    await page.waitForSelector('.ant-form-item-control > .ant-form-item-children > #ownerId > .ant-select-selection > .ant-select-selection__rendered')
    await page.click('.ant-form-item-control > .ant-form-item-children > #ownerId > .ant-select-selection > .ant-select-selection__rendered');
    await page.type('.ant-form-item-control > .ant-form-item-children > #ownerId > .ant-select-selection > .ant-select-selection__rendered', 'xueqing');

    await page.waitForSelector('#owner-2');
    await page.click('#owner-2');

    await page.waitForSelector('.ant-form-item-control > .ant-form-item-children > #timeRange > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)');
    await page.click('.ant-form-item-control > .ant-form-item-children > #timeRange > .ant-calendar-picker-input > .ant-calendar-range-picker-input:nth-child(1)');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.ant-card-body > .ant-row > .ant-col > .f-tar > .ant-btn:nth-child(2)');
    await page.click('.ant-card-body > .ant-row > .ant-col > .f-tar > .ant-btn:nth-child(2)');

    await page.waitFor(1000);

    await page.waitForSelector('.ant-col > .ant-breadcrumb > span > .ant-breadcrumb-link > a');
    await page.click('.ant-col > .ant-breadcrumb > span > .ant-breadcrumb-link > a');

    await page.waitFor(1000);

    browser.close();
  }, 9000000);
});
