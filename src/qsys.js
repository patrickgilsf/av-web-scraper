import puppeteer from 'puppeteer';

class Qsys {

  constructor ({username = "", password = "", ip = "", options = {}}) {
    this.username = username;
    this.password = password;
    this.ip = ip;
    this.options = options;
  };

  //adds delay in event loop
  delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

  //gets data from a single core
  getData = async (ip) => {
    //allow ip field to be modified
    ip ? this.ip = ip : null;
    this.options.verbose ? console.log(`ip is set to ${this.ip}`) : null;
    const browser = await puppeteer.launch({
      headless: this.options.headless == false ? false : true,
      ignoreHTTPSErrors: true,
      acceptInsecureCerts: true,
      args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    //function to log in to core
    let login = async () => {
      await page.goto(`http://${this.ip}/users/login`);
      await page.waitForSelector('input[name="username"]').then(() => this.options.verbose ? console.log('found username field') : null);
      await page.type('input[name="username"]', this.username);
      await page.type('input[name="password"]', this.password);
      await page.click('button[type="submit"]', {waitUntil: 'domcontentloaded'}).then(() => {
        this.options.verbose ? console.log(`successfully logged in to ${this.ip}!`) : null;
      });
      await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    };

    let mem = async () => {
      try {
        await login();
      } catch (e) {console.log(e)};
  
      //declare iFrame
      let iFrame;
      //go to network debug page
      await page.goto(`http://${this.ip}/support/network_debug`);
      await page.waitForSelector('iframe[title="Debug Page"]')
      .then(async (res) => {
        iFrame = await res.contentFrame();
        await iFrame.waitForSelector("#command-option")
      }).then(() => {
        iFrame.select("#command-option", "memstat")
      });
      //selector for Go button
      let go = "body > div > div > div.input-container > button";
      await iFrame.waitForSelector(go);
      await iFrame.click(go);
      await this.delay(1000);
      //return data
      return await iFrame.$eval("#response-area", el => el.innerHTML);
    };

    //final process from nested functions
    try {
      const rtn = await mem();
      browser.close();
      let rtnArr = rtn.split("\n").filter(a => a != "");
      return Object.fromEntries(rtnArr
        .map(line => [line.match(/(\w+):/)[1], line.match(/:\s(.+)/)[1]]))
    } catch(e) {console.log(e)};
  };

  //get data from multiple cores, in an array
  getAllData = async (arr) => {
    let rtn = [];
    for (let ip of arr) {
      console.log(`gathering qsys memory information from ${ip}...`)
      try {
        rtn.push({
          ip, //short hand for ip: ip
          stats: await this.getData(ip)
        })
      } catch (e) {console.log(e)};
    };

    return rtn;
  }
} 

export default Qsys;