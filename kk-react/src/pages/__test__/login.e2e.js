import puppeteer from 'puppeteer';
import { cookie, port } from '@tests/shared/data';
import { sleep } from '@tests/utils';

describe('Test process', () => {

  test('can run successfully all process', async () => {
    let browser = await puppeteer.launch({
      headless: false,
      slowMo: 250
    });
    let page = await browser.newPage();

    await page.goto(`http://localhost:${port}/`)

    await page.setCookie(...cookie); // 设置cookie

    await page.setViewport({ width: 1440, height: 789 })

    // 工作台
    await page.waitForSelector('span > .login_banner_38ic8 > .login_wrap_1el8E > div > .ant-btn-primary')
    await page.click('span > .login_banner_38ic8 > .login_wrap_1el8E > div > .ant-btn-primary')

    await page.waitForSelector('.ant-card > .ant-card-body > .Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(2) > .Tabs_text_bDa9O')
    await page.click('.ant-card > .ant-card-body > .Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(2) > .Tabs_text_bDa9O')

    await page.waitForSelector('.Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(3) > .Tabs_text_bDa9O > .ant-badge > .f-fs3')
    await page.click('.Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(3) > .Tabs_text_bDa9O > .ant-badge > .f-fs3')

    await page.waitForSelector('.ant-card-body > .Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(4) > .Tabs_text_bDa9O > span')
    await page.click('.ant-card-body > .Tabs_container_3hiyw > .Tabs_tabTodo_3RMDz:nth-child(4) > .Tabs_text_bDa9O > span')

    await page.waitForSelector('div > .layouts_root_2XRXm > .layouts_header_2_57M > .layouts_quickTool_2zbUp > .u-mgl10')
    await page.click('div > .layouts_root_2XRXm > .layouts_header_2_57M > .layouts_quickTool_2zbUp > .u-mgl10')

    // 产品管理
    await page.waitForSelector('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(2) > .product_manage_liStyle_1bFxR')
    await page.click('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(2) > .product_manage_liStyle_1bFxR')

    await page.waitForSelector('.product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(3) > .product_manage_liStyle_1bFxR > .u-mgl10')
    await page.click('.product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(3) > .product_manage_liStyle_1bFxR > .u-mgl10')

    await page.waitForSelector('.product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(4) > .product_manage_liStyle_1bFxR > .u-mgl10')
    await page.click('.product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(4) > .product_manage_liStyle_1bFxR > .u-mgl10')

    await page.waitForSelector('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(5) > .product_manage_liStyle_1bFxR')
    await page.click('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(5) > .product_manage_liStyle_1bFxR')

    await page.waitForSelector('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(6) > .product_manage_liStyle_1bFxR')
    await page.click('.layouts_container_erFot > .product_manage_sider_3iFbE > .product_manage_ulStyle_2YusC > a:nth-child(6) > .product_manage_liStyle_1bFxR')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLi_3i5YW > span > .product_manage_childDiv_1F8_e:nth-child(1)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLi_3i5YW > span > .product_manage_childDiv_1F8_e:nth-child(1)')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(2)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(2)')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(3)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(3)')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(4)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(4)')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(5)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(5)')

    await page.waitForSelector('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(6)')
    await page.click('.product_manage_ulStyle_2YusC > a > .product_manage_receiptLiActive_2VwR8 > span > .product_manage_childDiv_1F8_e:nth-child(6)')

    await page.waitForSelector('table > .ant-table-tbody > .ant-table-row:nth-child(1) > td:nth-child(2) > div')
    await page.click('table > .ant-table-tbody > .ant-table-row:nth-child(1) > td:nth-child(2) > div')

    await page.waitForSelector('.layouts_main_1UeMl > div > span > div > .f-jcsb-aic:nth-child(2)')
    await page.click('.layouts_main_1UeMl > div > span > div > .f-jcsb-aic:nth-child(2)')

    // 项目管理
    await page.waitForSelector('div > .layouts_root_2XRXm > .layouts_header_2_57M > .layouts_quickTool_2zbUp > .layouts_btnUnSelect_2e9uQ')
    await page.click('div > .layouts_root_2XRXm > .layouts_header_2_57M > .layouts_quickTool_2zbUp > .layouts_btnUnSelect_2e9uQ')

    await page.waitForSelector('.ant-table-body > table > .ant-table-tbody > .ant-table-row:nth-child(1) > td:nth-child(3)')
    await page.click('.ant-table-body > table > .ant-table-tbody > .ant-table-row:nth-child(1) > td:nth-child(3)')

    await sleep(3000);
    await browser.close()
  }, 9000000);
});
