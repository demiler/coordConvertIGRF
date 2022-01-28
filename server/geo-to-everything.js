const { gteValidator } = require('./validators.js');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const utils = require('./utils.js');

module.exports.convert = async (data) => {
  if (!gteValidator(data)) {
    return { code: 403, error: 'data didn\'t pass the validation' }
  }

  let out = {
    date: [ data.date ],
    time: [ data.time ],
  };

  if (data.geod) {
    return { code: 400, error: 'geod is not supported yet' };
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

    out.length = 1;
    return { code: 0, data: out };
  }
  catch (err) {
    return { code: 500, error: `Something went wrong during GTE convresion: ${err}` };
  }
}
