const utils = require('./utils.js')
const Consts = require('./consts.js')

//output l, b coordinates

//time is not used here at all
//function geo2LBOnly(year, month, monthDay, hours, minutes, secs, geoCoords) {
function geo2LBOnly(year, month, monthDay, geoCoords) {
  dayID = utils.dayInYear(year, month, monthDay);
  flatYear = year + dayID / 365;

  const [ alt, lat, lon ] = Object.values(ecef2geod(geoCoords))
  const gmf = igrf_lb(lat, lon, alt, flatYear);

  return [ gmf.lval, gmf.magnAbs ];
}

/*todo: implement
FELDCOF
  - GETSHC
  - INTERSHC
  - EXTRASHC

FELDG

SHELLG
  - STOER
    - FELDI (entry of FELDG)
*/
function igrf_lb(lat, lon, alt, flatYear) {
  const DIMO = FELDCOF(flatYear);
  const [ BNORTH, BEAST, BDOWN, BABS ] = FELDG(lat, lon, alt);
  const [ XL, ICODE, BAB1 ] = SHELLG(lat, lon, alt, DIMO);

  const DIP = utils.radians(1 / Math.asin(BDOWN / BABS))
  const sq = Math.sqrt(BEAST*BEAST + BNORTH*BNORTH)
  const DEC = utils.radians(1 / Math.asin(BEAST / sq))

  //xxx,yyy,zzz same for b??? - some vars assigned
  //somewhere in FELDCOF, FELDG and SHELLG
  const ERAD = Consts.Earth.radius.mean;
  const geoCoords = { x: ERAD * xxx, y: ERAD * yyy, z: ERAD * zzz };
  const magnField = { x: bxxx * 1e5, y: byyy * 1e5, z: bzzz * 1e5 };

  return { //geomagneticField
    geo: geoCoords,
    magn: magnField,
    lval: XL,
    lcode: ICODE, //1 - 'correct', 2 - 'incorrect', 3 - 'approx'
    inclination: DIP,
    declination: DEC,
    magnAbs: BABS
  }
}

/****************************************
* Implementation of Ferrari's solution
* of geo coordinates conversion to ecef
* keyword: Geographic coordinate conversion
*****************************************/
function ecef2geod(geoCoords) {
  const a = Consts.Earth.radius.equatorial;
  const b = Consts.Earth.radius.polar;
  const e2 = 1 - Math.pow((b / a), 2);

  const [x, y, z] = geoCoords;

  const r = Math.sqrt(x*x + y*y);
  const es2 = Math.pow((a / b), 2) - 1;

  const F = 54 * b*b * z*z;
  const G = r*r + (1 - e2) * z*z - e2 * (a*a - b*b)

  const c = (F * e2*e2 * r*r) / (G*G*G);
  const s = Math.pow(1 + c + Math.sqrt(c*c + 2 * c), 1 / 3)

  const P = F / (3 * G*G * Math.pow((s + 1 + 1 / s), 2))
  const Q = Math.sqrt(1 + 2 * e2*e2 * P)

  let r0 = a*a * (1 + 1 / Q) / 2
  r0 = r0 - (P * (1 - e2) * z*z) / (Q * (1 + Q)) - P * r*r / 2
  r0 = -(P * e2 * r) / (1 + Q) + Math.sqrt(r0)

  const U = Math.sqrt(Math.pow((r - e2 * r0), 2) + z*z)
  const V = Math.sqrt(Math.pow((r - e2 * r0), 2) + z*z * (1 - e2))
  const z0 = b*b * z / (a * V)

  const h = U * (1 - b*b / (a * V))
  const phi = Math.atan((z + es2 * z0) / r)
  const lambda = Math.atan2(y, x)

  return { altitude: h, latitude: utils.radians(phi), longitude: utils.radians(lambda) };
}
