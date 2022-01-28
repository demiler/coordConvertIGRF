const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const existsSync = require('fs').existsSync;
const utils = require('./utils.js');
const config = require('./config.js');
const { createSimpleLogger } = require('simple-node-logger');

const NTEConvert = require('./norad-to-everything').convert;
const GTEConvert = require('./geo-to-everything').convert;

const app = express()
const jsonParser = bodyParser.json()
const logger = createSimpleLogger({ dateFormat: 'YYYY-MM-DD HH:mm:ss' });

//check for files and programs
for (const prog of Object.values(config.PROGS)) {
  progpath = path.join(__dirname, config.PROG_DIR, prog)
  if (!existsSync(progpath)) {
    console.error(`Error: program ${prog} dosen't exsists in ${config.PROG_DIR}`);
    process.exit(1);
  }
}
logger.log('Convert programs are accessable');

if (!existsSync(path.join(__dirname, config.WS_DIR))) {
  console.error(`Website folder dosen't exsists`);
  process.exit(1);
}


app.use('/', express.static(path.join(__dirname, config.WS_DIR)))

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;
  let outcome = undefined;

  switch (data.type) {
    case 'nte': //norad to everything
      outcome = await NTEConvert(data);
      break;

    case 'gte': //geo to everything
      outcome = await GTEConvert(data, res);
      break;

    //case 'ntg': //norad to geo - depricated
      //break;
    default:
      logger.error(`Unkown data type '${data.type}'`);
      res.status(400).end('unknown data type');
  }

  if (outcome.code !== 0) {
    logger.error(`[${outcome.code}] `, outcome.error);
    res.status(outcome.code).end(outcome.error);
  }
  else {
    logger.info(`Successfully converted ${data.type} type request`);
    res.send(outcome.data).end();
  }
});

app.listen(config.PORT, () => {
  logger.info(`Server started on port ${config.PORT}`);
});
