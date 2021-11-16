const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const existsSync = require('fs').existsSync;
const utils = require('./utils.js');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const config = require('./config.js');
const { createSimpleLogger } = require('simple-node-logger');
const { nteValidator, gteValidator } = require('./validators.js');


const app = express()
const logger = createSimpleLogger({ dateFormat: 'YYYY-MM-DD HH:mm:ss' });
const jsonParser = bodyParser.json()


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

  switch (data.type) {
    case 'nte': //norad to everything
      if (!nteValidator(data)) {
        loggger.error('data didn\'t pass the validation', nteValidator.errors);
        res.status(400).send('data didn\'t pass the validation').end();
        return;
      }

      const dtFrom = `${data.date[0]}T${data.time[0]}`
      const dtTo   = `${data.date[1]}T${data.time[1]}`

      try {
        const glaData = await launcher.geolla(data.norad, dtFrom, dtTo, data.step);

        let out = {
          date: glaData['date'],
          time: glaData['time'],
        };

        for (const prog in getters) {
          const vals = utils.differ(getters[prog], data.filters);

          if (vals.length !== 0) {
            const progOut = (prog === 'geolla')
              ? {
                  ...utils.explode(glaData['geo'], 'geo',  ['X', 'Y', 'Z']),
                  //...utils.explode(glaData['lla'], 'geod', ['Lat', 'Lon', 'Alt'])
                }
              : await launcher.fromGeo(prog, glaData['date'], glaData['time'], glaData['geo']);
            out = {...out, ...utils.filtered(progOut, vals)};
          }
        }

        logger.info('Successfully converted for NTE');
        out.length = glaData.date.length;
        res.send(out).end();
      } catch (err) {
        logger.error('Something went wrong during NTE convresion:\n', err);
        res.status(500).send(err).end();
      }
      break;

    case 'gte': //geo to everything
      if (!gteValidator(data)) {
        logger.error('data didn\'t pass the validation', gteValidator.errors);
        res.status(400).end('data didn\'t pass the validation');
        return;
      }

      let out = {
        date: [ data.date ],
        time: [ data.time ],
      };

      if (data.geod) {
        res.status(400).send('geod is not supported yet').end();
        return;
      }

      let geo = [], lla = [];
      if (data.geod) {
        lla = data.coord;
        geo = coords.lla2geo(lla[0], lla[1], lla[2]);
      }
      else {
        geo = data.coord;
        //lla = coords.geo2lla(geo[0], geo[1], geo[2]);
      }

      const glVals = utils.differ(getters['geolla'], data.filters);
      const glData = {
        'geo.X':    [geo[0]], 'geo.Y':    [geo[1]], 'geo.Z':    [geo[2]],
      };
      if (data.geod) {
        glData['geod.Lat'] = [lla[0]];
        glData['geod.Lon'] = [lla[1]];
        glData['geod.Alt'] = [lla[2]];
        const excludeFilters = ['geod.Lat', 'geod.Lon', 'geod.Alt']
        data.filters = data.filters.filter(x => !excludeFilters.includes(x))
      }
      out = { ...out, ...utils.filtered(glData, glVals) };

      try {
        for (const prog in getters) {
          if (prog === 'geolla') continue;
          const vals = utils.differ(getters[prog], data.filters);
          if (vals.length !== 0) {
            const progOut = await launcher.fromGeo(prog, data.date, data.time, data.coord)
            out = { ...out, ...utils.filtered(progOut, vals) };
          }
        }

        logger.info('Successfully converted for GTE');
        out.length = 1;
        res.send(out).end();
      }
      catch (err) {
        logger.error('Something went wrong during NTE convresion:\n', err);
        res.status(500).send(err).end();
      }
      break;

    //case 'ntg': //norad to geo - depricated
      //break;
    default:
      logger.error(`Unkown data type '${data.type}'`);
      res.status(400).end('unknown data type');
  }
});

app.listen(config.PORT, () => {
  logger.info(`Server started on port ${config.PORT}`);
});
