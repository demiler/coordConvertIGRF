const f = 0.0033528106647474805; //Earth flattening
const EarthEquator = 6378.137;

function deg2rad(deg) { return deg * Math.PI / 180.0; }

function lla2geo(lat, lon, alt) {
  lat = deg2rad(lat);
  lon = deg2rad(lon);

  const sqared = x => x*x

  const latcos2 = sqared(Math.cos(lat))
  const latsin2 = sqared(Math.sin(lat))
  const omf2    = sqared(1.0 - f)
  c = 1.0 / Math.sqrt(latcos2 + omf2 * latsin2)
  s = omf2 / Math.sqrt(latcos2 + omf2 * latsin2)

  x = (EarthEquator * c + alt) * Math.cos(lat) * Math.cos(lon);
  y = (EarthEquator * c + alt) * Math.cos(lat) * Math.sin(lon);
  z = (EarthEquator * s + alt) * Math.sin(lat);
  return [x, y, z];
}

module.exports = { lla2geo };
