const { nteValidator } = require('./validators.js');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const utils = require('./utils.js');

module.exports.convert = async (data) => {
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
