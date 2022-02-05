const { gteValidator } = require('./validators.js');
const stream = require('stream');
const readline = require('readline');
const coords = require('./coords.js');
const launcher = require('./launcher.js');
const getters = require('./getters.js');
const utils = require('./utils.js');

const { Spawner } = require('./apps.js');

function coordToGeo(crds, geod) {
  if (geod) {
    const geo = coords.lla2geo(crds[0], crds[1], crds[2]);
    return { 'geo.X': geo[0], 'geo.Y': geo[1], 'geo.Z': geo[2] };
  }
  return { 'geo.X': crds[0], 'geo.Y': crds[1], 'geo.Z': crds[2] };
}
module.exports.convertFile = async (data, file) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);
  const rl = readline.createInterface({ input: bufferStream });

  const progs = Spawner.alloc(data.filters);
  progs.spawn();

  const geosToAdd = utils.differ(['geo.X', 'geo.Y', 'geo.Z'], data.filters);
  const result = Object.fromEntries(
    [ 'date', 'time', ...geosToAdd, ...data.filters ]
    .map(key => [key, []])
  );

  let totalLines = 0;
  for await (const line of rl) {
    const data = line.trim().split(',').map(el => el.trim());

    const dtSplit = data[0].split(' ');
    const date = dtSplit[0];
    const time = dtSplit[1];
    const geo = coordToGeo(data.slice(1, 4).map(Number), data.geod);

    progs.writeline(date, time, geo);
    result['date'].push(date);
    result['time'].push(time);
    geosToAdd.forEach(key => result[key].push(geo[key]));

    totalLines++;
  }
  result.length = totalLines;

  let errorLine = 0;
  try {
    for (let i = 0; i < totalLines; i++) {
      errorLine = i + 1;
      const ans = await progs.readline();
      Object.entries(ans).forEach(([key, val]) => result[key].push(val));
    }
    progs.close();
    return { code: 0, data: result };
  }
  catch(err) {
    progs.close();
    return { code: 500, error: err, errorLine };
  }
}

module.exports.convert = async (data) => {
  if (!gteValidator(data)) {
    return { code: 403, error: 'data didn\'t pass the validation' }
  }

  const progs = Spawner.alloc(data.filters);
  progs.spawn();

  const geosToAdd = utils.differ(['geo.X', 'geo.Y', 'geo.Z'], data.filters);
  const result = Object.fromEntries(
    [ 'date', 'time', ...geosToAdd, ...data.filters ]
    .map(key => [key, []])
  );
  result.length = 1;

  const geo = coordToGeo(data.coord, data.geod);
  result['date'].push(data.date);
  result['time'].push(data.time);
  geosToAdd.forEach(key => result[key].push(geo[key]));

  try {
    progs.writeline(data.date, data.time, geo);
    const ans = await progs.readline();
    Object.entries(ans).forEach(([key, val]) => result[key].push(val));
    return { code: 0, data: result };
  }
  catch (err) {
    return { code: 500, error: `Something went wrong during GTE convresion: ${err}` };
  }
}
