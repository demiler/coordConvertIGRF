const f = 1.0 / 298.257223563; //Earth flattening
const EarthEqRad = 6378.137;

function deg2rad(deg) { return deg * Math.PI / 180.0; }
function squared(x) { return Math.pow(x, 2); }

function lla2geo(lat, lon, alt) {
  lat = deg2rad(lat);
  lon = deg2rad(lon);

  const latcos2 = squared(Math.cos(lat))
  const latsin2 = squared(Math.sin(lat))
  const omf2    = squared(1.0 - f)
  const c = 1.0 / Math.sqrt(latcos2 + omf2 * latsin2)
  const s = omf2 / Math.sqrt(latcos2 + omf2 * latsin2)

  const x = (EarthEqRad * c + alt) * Math.cos(lat) * Math.cos(lon);
  const y = (EarthEqRad * c + alt) * Math.cos(lat) * Math.sin(lon);
  const z = (EarthEqRad * s + alt) * Math.sin(lat);
  return [x, y, z];
}

module.exports = { lla2geo };
