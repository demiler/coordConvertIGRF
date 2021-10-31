const bodyParser = require('body-parser');
const { validator } = require('@exodus/schemasafe')
const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const utils = require('./utils.js');
const launcher = require('./launcher.js');

const PORT = 8081
const app = express()
const jsonParser = bodyParser.json()

const getters = {
  'geolla':
    [ 'geo.X', 'geo.Y', 'geo.Z', 'geod.Lat', 'geod.Lon', 'geod.Alt' ],
  'geo2LBOnly':
    [ 'l', 'b' ],
  'geo2BigrfOnly':
    [ 'magn.X', 'magn.Y', 'magn.Z', 'magn.F' ],
  'geo2RDMLLGsmMltShadOnly':
    [
      'dm.R', 'dm.Lat', 'dm.Lon',
      'gsm.X',  'gsm.Y',  'gsm.Z',
      'mlt', 'shad'
    ],
};

const nteValidator = validator({
  type: 'object',
  required: ['date', 'time', 'norad', 'filters'],
  properties: {
    date:    { type: 'array', minItems: 2, maxItems: 2, items: { type: 'string', format: 'date' }},
    time:    { type: 'array', minItems: 2, maxItems: 2, items: {
      type: 'string',
      pattern: '^((2[0-3]|[0-1]\\d):[0-5]\\d:[0-5]\\d|23:59:60)$',
    }},
    norad:   { type: 'number', },
    filters: { type: 'array', minItems: 1, items: { type: 'string' }},
  }
});

const gteValidator = validator({
  type: 'object',
  required: ['coord', 'geod', 'date', 'time', 'filters'],
  properties: {
    coord:   { type: 'array', minItems: 3, maxItems: 3, items: { type: 'number' }},
    geod:    { type: 'boolean' },
    date:    { type: 'string', format: 'date', },
    time:    { type: 'string', pattern: '^((2[0-3]|[0-1]\\d):[0-5]\\d:[0-5]\\d|23:59:60)$' },
    filters: { type: 'array', minItems: 1, items: { type: 'string' }},
  }
});

app.use('/', express.static(path.join(__dirname, '../dist')))

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;

  switch (data.type) {
    case 'nte': //norad to everything
      if (!nteValidator(data)) {
        console.log('Error data didn\'t pass the validation', nteValidator.errors);
        res.status(400).end();
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
        res.send(out);
        res.end();
      } catch (err) {
        console.log('ERROR:', err);
        res.status(500).end();
      }
      break;

    case 'gte': //geo to everything
      if (!gteValidator(data)) {
        console.log('Error data didn\'t pass the validation');
        res.status(400).end();
        return;
      }

      let out = {
        date: data.date,
        time: data.time,
      };

      try {
        for (const prog in getters) {
          if (prog === 'geolla') continue;
          const vals = utils.differ(getters[prog], data.filters);
          if (vals.length !== 0) {
            const progOut = await launcher.fromGeo(prog, data.date, data.time, data.coord)
            out = { ...out, ...utils.filtered(progOut, vals) };
          }
        }

        res.send(out);
        res.end();
      }
      catch (err) {
        console.log('ERROR:', err);
        res.status(500).end();
      }
      break;

    //case 'ntg': //norad to geo - depricated
      //break;
    default:
      console.log('Error unknown data type:', data.type);
      console.log(data);
      res.status(400).end();
  }
});

app.listen(PORT, () => {
  console.log('Server started');
});
