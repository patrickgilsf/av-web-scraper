import puppeteer from 'puppeteer';

class Logitech {

  constructor({username = "", password = "", options = {}}) {
    this.username = username;
    this.password = password;
    this.options = options;
  }

  //get data from logitech sync portal
  getData = async () => {
    console.log('gathering logitech data...')
    const browser = await puppeteer.launch({
      headless: this.options.headless == false ? false : true
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 3000, height: 1080 });

    //login to site
    let login = async () => {
      await page.goto('https://sync.logitech.com/login');
      await page.waitForSelector("#username");
      await page.type("#username", this.username);
      await page.type("#password", this.password);
      await page.click('button[type="submit"]').then(() => {
        this.options.verbose ? console.log(`successfully logged in!`) : null;
      })
    };

    try {
      await login();
    } catch(e) {console.log(e)};  

    //ip dropdown
    let btn = 'button[class="ResetButton-sc-1odl874-0 IconButton__StyledButton-sc-q31i48-1 dnXLqT fawEUo"]';
    await page.waitForSelector(btn).then(() => page.$eval(btn, (e) => e.click()));

    //find ip address
    let check = '#checkbox_17';
    await page.waitForSelector(check).then(() => page.$eval(check, (e) => e.click()));
    let ipSel = 'p[class="Body__Body3-sc-17rsza-2 eTmBik"]';
    await page.waitForSelector(ipSel);
    const ips = await page.$$eval(ipSel, ips => {
      return ips.map(b => b.innerHTML)
    });
    
    //find name, sync version, status, update channel
    let dataSel = 'div[class="wrappers__EllipsisCell-sc-16ba2bee-7 iJDBII"]';
    await page.waitForSelector(dataSel);
    const rowData = await page.$$eval(dataSel, names => names.map(b => b.innerHTML));
    const names = rowData.filter(a => a.match(/\w+-\d+.*/gi));
    const versions = rowData.filter(a => a.match(/1\.1[12]\.\d\d\d/));

    //handle errors, close errors if not
    ips && names ? browser.close() : console.log('error getting ips or names');

    //return body
    let rtn = [];

    for (let i = 0; i < ips.length; i++) {
      rtn[i] = {
        name: names[i],
        ip: ips[i],
        version: versions[1]
      }
    };

    return rtn;
  }
}

export default Logitech;