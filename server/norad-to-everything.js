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

      result['date'].push(glData['date']);
      result['time'].push(glData['time']);
      geosToAdd.forEach(geo => result[geo].push(glData[geo]));
      progs.writeline(glData['date'], glData['time'], glData);

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
