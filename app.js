import Qsys from './src/qsys.js';
import Creds from './noGit/config.js';
import Logitech from './src/logi.js';
import Dten from './src/dten.js';

let q = new Qsys({
  username: Creds.QSC.UN,
  password: Creds.QSC.PW,
  ip: "", //add ip of q-sys here
  options: {
    headless: false //switch headless to false to see browser activity
  }
});

//or, add multipe ips
const qArray = [
  "192.168.42.148",
  "192.168.42.50"
];

let logi = new Logitech({
  username: Creds.Logi.UN,
  password: Creds.Logi.PW,
  options: {
    headless: true
  }
});

let dten = new Dten({
  username: Creds.Dten.UN,
  password: Creds.Dten.PW,
  options: {
    headless: true
  }
});

const deviceData = async () => {

  const data = {
    dateGathered: new Date().toLocaleString(),
    qsysData: await q.getAllData(qArray), //remove if you have no qsys devices
    logiData: await logi.getData(), //remove if you have no logitech devices
    dtenData: await dten.getDevicesStatus() //remove if you have no DTEN devices
  };

  return data;
}

let devices = await deviceData();
for (let qs of devices.qsysData) {
  console.log(qs)
}
