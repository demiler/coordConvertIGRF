const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express');
const path = require('path');
const readline = require('readline');
const stream = require('stream');
const existsSync = require('fs').existsSync;
const utils = require('./utils.js');
const config = require('./config.js');
const { createSimpleLogger } = require('simple-node-logger');

const NTEConvert = require('./norad-to-everything').convert;
const GTEConvert = require('./geo-to-everything').convert;

const app = express()
const upload = multer();
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

app.post('/convert/file', upload.single('file'), async (req, res) => {

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  const rl = readline.createInterface({
    input: bufferStream
  });

  console.log(req.body);
  console.log('start');
  for await (const line of rl) {
    //console.log(line);
  }
  console.log('end');




  res.status(400).end('files are not accepted yet');
});

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;
  let outcome;

  //console.log([...data.entries()]);

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
      outcome = undefined;
  }

  if (outcome === undefined) {
      logger.error(`Unkown data type '${data.type}'`);
      res.status(400).end('unknown data type');
  }
  else if (outcome.code !== 0) {
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
