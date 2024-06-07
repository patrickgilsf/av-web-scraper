import puppeteer from 'puppeteer';

class Dten {
  constructor({username = "", password = "", options = {}}) {
    this.username = username;
    this.password = password;
    this.options = options;
  }

  login = async (page) => {
    await page.goto("https://orbit.dten.com/registration/login");
    await page.waitForSelector("#userName");
    await page.type("#userName", this.username);
    await page.type("#password", this.password);
    await page.click("#Btn_Login");
    await page.waitForNavigation({waitUntil: 'networkidle2'}).then(() => {
      this.options.verbose ? console.log(`successfully logged in!`) : null;
    });
  };

  //device online offline data
  getDevicesStatus = async () => {
    const browser = await puppeteer.launch({
      headless: this.options.headless == false ? false : true
    });
    const page = await browser.newPage();

    await this.login(page);

    //online and offline selectors
    let onlineSel = "#Btn_Unit_Online";
    let offlineSel = "#Btn_Unit_Offline";

    //get online device count
    await page.waitForSelector(onlineSel);
    let onlineDevices = Number(await page.$eval(onlineSel, el => el.innerText.match(/\d+/)[0]));
    !onlineDevices ? console.log('no onlines DTEN devices!') : null;
    //get offline device count
    let offlineDevices = Number(await page.$eval(offlineSel, el => el.innerText.match(/\d+/)[0]));

    await browser.close();
    return {
      totalDevices: onlineDevices + offlineDevices,
      onlineDevices,
      offlineDevices
    }
  }
}

export default Dten;