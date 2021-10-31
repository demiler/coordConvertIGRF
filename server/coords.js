const a = 6378137; //Earth radius
const f = 0.0033528106647474805; //Earth flattening
const b = 6356752.3142; //Earth polar radius
const a2 = a*a;
const b2 = b*b;

const e = Math.sqrt((a2 - b2) / a2);
const eprime = Math.sqrt((a2 - b2) / b2);

const getN = (lat) => {
  const sinlat = Math.sin(lat);
  const denom = Math.sqrt(1-e*e*sinlat*sinlat);
  return a / denom;
}

function geo2lla(x, y, z) {
  const p = Math.sqrt(x*x + y*y);
  const theta = Math.atan((z * a) / (p * b));

  const sintheta = Math.sin(theta);
  const costheta = Math.cos(theta);

  const num = z + eprime * eprime * b * sintheta * sintheta * sintheta;
  const denom = p - e * e * a * costheta * costheta * costheta;

  //Now calculate LLA
  let lat  = Math.atan(num / denom);
  let lon = Math.atan(y / x);
  const N = getN(lat);
  let alt  = (p / Math.cos(lat)) - N;

  if (x < 0 && y < 0) {
      lon = lon - Math.PI;
  }

  if (x < 0 && y > 0) {
      lon = lon + Math.PI;
  }

  return [lat, lon, alt];
}

function lla2geo(lat, lon, alt) {
  //Auxiliary values first
  const N = getN(lat);
  const ratio = (b2 / a2);

  //Now calculate the Cartesian coordinates
  const x = (N + alt) * Math.cos(lat) * Math.cos(lon);
  const y = (N + alt) * Math.cos(lat) * Math.sin(lon);

  //Sine of lat looks right here
  const z = (ratio * N + alt) * Math.sin(lat);
  return [x, y, z];
}

module.exports = { geo2lla, lla2geo };
