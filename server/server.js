const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const utils = require('./utils.js');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const { nteValidator, gteValidator } = require('./validators.js');

const PORT = 8081
const app = express()
const jsonParser = bodyParser.json()

app.use('/', express.static(path.join(__dirname, '../dist')))

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;

  switch (data.type) {
    case 'nte': //norad to everything
      if (!nteValidator(data)) {
        console.log('ERROR: data didn\'t pass the validation', nteValidator.errors);
        console.log(data);
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
                  ...utils.explode(glaData['lla'], 'geod', ['Lat', 'Lon', 'Alt'])
                }
              : await launcher.fromGeo(prog, glaData['date'], glaData['time'], glaData['geo']);
            out = {...out, ...utils.filtered(progOut, vals)};
          }
        }

        out.length = glaData.date.length;
        res.send(out).end();
      } catch (err) {
        console.log('ERROR:', err);
        res.status(500).send(err).end();
      }
      break;

    case 'gte': //geo to everything
      if (!gteValidator(data)) {
        console.log('ERROR: data didn\'t pass the validation', gteValidator.errors);
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
        lla = coords.geo2lla(geo[0], geo[1], geo[2]);
      }

      const glVals = utils.differ(getters['geolla'], data.filters);
      const glData = {
        'geo.X':    [geo[0]], 'geo.Y':    [geo[1]], 'geo.Z':    [geo[2]],
        //'geod.Lat': [lla[0]], 'geod.Lon': [lla[1]], 'geod.Alt': [lla[2]],
        'geod.Lat': [NaN], 'geod.Lon': [NaN], 'geod.Alt': [NaN],
      };
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

        out.length = 1;
        res.send(out).end();
      }
      catch (err) {
        console.log('ERROR:', err);
        res.status(500).send(err).end();
      }
      break;

    //case 'ntg': //norad to geo - depricated
      //break;
    default:
      console.log('ERROR: unknown data type:', data.type);
      res.status(400).end('unknown data type');
  }
});

app.listen(PORT, () => {
  console.log('Server started');
});
