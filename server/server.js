const bodyParser = require('body-parser');
const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const utils = require('./utils.js');
const launcher = require('./launcher.js');

const PORT = 8081
const app = express()
const jsonParser = bodyParser.json()

app.use('/', express.static(path.join(__dirname, '../dist')))

/*
{
  convertType: 'NTE', //or 'GTE' or 'NTG',
  norad: 324,
  date: [ '2020-01-22', '2021-02-22' ],
  time: [ '12:12:12', '00:00:00' ],
  filters: [
    'shad', 'l', 'b'
    'geoX', 'geoY', 'geoZ',
    'magnX', 'magnY', 'magnF',
    'dmLat'
  ]
}
*/

const getters = {
  'geolla':
    [ 'geo.X', 'geo.Y', 'geo.Z', 'Lat', 'Lon', 'Alt' ],
  'geo2LBOnly':
    [ 'l', 'b' ],
  'geo2BigrfOnly':
    [ 'magn.X', 'magn.Y', 'magn.Z', 'magn.F' ],
  'geo2RDMLLGsmMltShadOnly':
    [
      'dm.Lat', 'dm.Lon', 'dm.Alt',
      'gsm.X',  'gsm.Y',  'gsm.Z',
      'mlt', 'shad'
    ],
};

app.post('/convert', jsonParser, async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  data = req.body;

  switch (data.type) {
    case 'nte': //norad to everything
      if (data.date.length == 1)
        data.date.push(curDate());
      if (data.time.length == 1)
        data.time.push(curTime());

      dtFrom = `${data.date[0]}T${data.time[0]}`
      dtTo   = `${data.date[1]}T${data.time[1]}`

      try {
        const geo = launcher.geolla(data.norad, dtFrom, dtTo, data.step);
        const out = {};

        for (const prog in getters) {
          const vals = uitls.differ(getters[prog], data.filters);

          if (vals.length !== 0) {
            const progOut = (prog === 'geolla')
              ? geo
              : launcher.start(prog, {...data, ...geo});
            out = {...out, ...utils.filtered(progOut, vals)};
          }
        }

        res.send(out);
        res.end();
      } catch (err) {
        res.status(400).end()
      }
      break;

    case 'gte': //geo to everything
      break;
    case 'ntg': //norad to geo
      break;
    default:
      res.status(400).end();
  }
});

app.listen(PORT, () => {
  console.log('Server started');
});
