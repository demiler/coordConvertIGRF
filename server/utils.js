const stringify = s =>
  (s && typeof s === 'object') ?  Object.values(s).map(stringify).join(' ') : String(s)

const filtered = (obj, keys) =>
  keys.reduce((res, key) => ({ ...res, [key]: obj[key] }), {});

const differ = (src, filter) =>
  src.filter(el => filter.includes(el))

const explode = (arr, name, subnames) => {
  return subnames.reduce((obj, sn, i) => {
    obj[`${name}.${sn}`] = arr.map(vals => vals[i]);
    return obj;
  }, {});

  return arr.map(vals =>
    subnames.reduce((obj, sn, i) => {
      obj[`${name}.${sn}`] = vals[i]
      return obj;
    }, {})
  );
};

const getCoord = (geo, lla = false) => {
  return lla
    ? [ geo['Lat'], geo['Lon'], geo['Alt'] ]
    : [ geo['geo.X'], geo['geo.Y'], geo['geo.Z'] ]
}

module.exports = { stringify, filtered, explode, differ }
