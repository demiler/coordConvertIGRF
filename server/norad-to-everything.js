const { nteValidator } = require('./validators.js');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const utils = require('./utils.js');

const { Spawner, Geolla } = require('./apps.js');

module.exports.convert = async (data) => {
  if (!nteValidator(data)) {
    return { code: 403, error: 'data didn\'t pass the validation' };
  }

  const glProg = new Geolla();
  const progs = Spawner.alloc(data.filters);

  const dtFrom = `${data.date[0]}T${data.time[0]}`
  const dtTo   = `${data.date[1]}T${data.time[1]}`

  progs.spawn();
  glProg.spawn(data.norad, dtFrom, dtTo, data.step);

  const geosToAdd = utils.differ(['geo.X', 'geo.Y', 'geo.Z'], data.filters);
  const result = Object.fromEntries([ 'date', 'time', ...data.filters ].map(key => [key, []]));

  try {
    let totalLines = 0;
    let glData = await glProg.readline();
    while (glData !== undefined) {
      totalLines++;

      const date = glData['date'];
      const time = glData['time'];
      const geo = { X: glData['geo.X'], Y: glData['geo.Y'], Z: glData['geo.Z'] };

      result['date'].push(date);
      result['time'].push(glData['time']);
      geosToAdd.forEach(geo => result[geo].push(glData[geo]));
      progs.writeline(date, time, geo);

      glData = await glProg.readline();
    }
    result.length = totalLines;

    for (let i = 0; i < totalLines; i++) {
      const ans = await progs.readline();
      Object.entries(ans).forEach(([key, val]) => result[key].push(val));
    }

    progs.close();
    glProg.close();
    return { code: 0, data: result };
  } catch (err) {
    return { code: 500, error: `Something went wrong during NTE convresion ${err}` };
  }
}

module.exports.convert_old = async (data) => {
  if (!nteValidator(data)) {
    return { code: 403, error: 'data didn\'t pass the validation' };
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

    out.length = glaData.date.length;
    return { code: 0, data: out };
  } catch (err) {
    return { code: 500, error: `Something went wrong during NTE convresion ${err}` };
  }
}
