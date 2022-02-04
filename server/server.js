const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express');
const path = require('path');
const readline = require('readline');
const stream = require('stream');
const existsSync = require('fs').existsSync;
const btsize = require('byte-size');
const utils = require('./utils.js');
const config = require('./config.js');
const coords = require('./coords.js');
const { createSimpleLogger } = require('simple-node-logger');

const { Spawner, Geolla } = require('./apps.js');
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
logger.info('Convert programs are accessable');

if (!existsSync(path.join(__dirname, config.WS_DIR))) {
  console.error(`Website folder dosen't exsists`);
  process.exit(1);
}


app.use('/', express.static(path.join(__dirname, config.WS_DIR)))

app.post('/convert/file', upload.single('file'), async (req, res) => {
  const fileSize = btsize(req.file.size);
  logger.info(`Got file to convert [${fileSize.value}${fileSize.unit}]`);

  const filters = JSON.parse(req.body.filters);
  const geod = JSON.parse(req.body.geod);

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);
  const rl = readline.createInterface({ input: bufferStream });

  const progs = Spawner.alloc(filters);
  progs.spawn();

  let totalLines = 0;

  const geoFTS = { 'geo.X': 'X', 'geo.Y': 'Y', 'geo.Z': 'Z' }; //geo full to short
  const geosToAdd = utils.differ(Object.keys(geoFTS), filters);
  const result = Object.fromEntries(
    [ 'date', 'time', ...geosToAdd, ...filters ]
    .map(key => [key, []])
  );

  for await (const line of rl) {
    const data = line.trim().split(',').map(el => el.trim());

    const dtSplit = data[0].split(' ');
    const date = dtSplit[0];
    const time = dtSplit[1];

    const geo = (() => {
      if (geod) {
        const crd = coords.lla2geo(Number(data[1]), Number(data[2]), Number(data[3]));
        return { X: crd[0], Y: crd[1], Z: crd[2] };
      }
      return { X: data[1], Y: data[2], Z: data[3] }
    })();

    progs.writeline(date, time, geo);
    result['date'].push(date);
    result['time'].push(time);
    geosToAdd.forEach(key => result[key].push(geo[geoFTS[key]]));

    totalLines++;
  }

  result.length = totalLines;


  try {
    for (let i = 0; i < totalLines; i++) {
      const ans = await progs.readline();
      Object.entries(ans).forEach(([key, val]) => result[key].push(val));
    }
  }
  catch(err) {
    logger.error('Somethign went wrong while reading results:\n', err);
    res.status(500).end('Unable to convert data');
    progs.close();
    return;
  }

  logger.info('File successfuly converted');
  res.send(JSON.stringify(result));
  res.status(200).end();
  progs.close();
});

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;
  let outcome;

  //console.log([...data.entries()]);

  switch (data.type) {
    case 'nte': //norad to everything
      //avg geolla line data size: 90 bytes,
      //if { ((dtEnd - dtStart) / stepSec) * 90 > 1Mb } -> send as file
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
