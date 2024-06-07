import dotenv from 'dotenv';
dotenv.config();

const Creds = {
  QSC: {
    UN: process.env.qUN,
    PW: process.env.qPW
  },
  Logi: {
    UN: process.env.lUN,
    PW: process.env.lPW
  },
  Dten: {
    UN: process.env.dUN,
    PW: process.env.dPW
  }
}



export default Creds