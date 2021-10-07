const utils = require('./utils.js');
const Consts = require('./consts.js');

function geo2BigrfOnly(year, month, day, hours, minutes, seconds, geoCoords) {
  flatYear = year + utils.dayInYear(year, month, day) / 365;

  const [ Bigrf, amodB ] = igrf12(flatYear, geoCoords);
  return { Bigrf, amodB };
}

//todo: implement igrf12syn
function igrf12(flatYear, geoCoords) {
  const ErthRad = Consts.Earth.radius.mean;
  const [x, y, z] = geoCoords.map(X => X / ErthRad);
  
  const [ R, theta, phi ] = sphcar_08_neg(x, y, z);
  const alt = R * ErthRad;
  const colat = utils.radius(theta);
  const elong = utils.radius(phi);

  const intensity = igrf12syn(0, flatYear, 2, alt, colat, elong);
  //intensity: {x, y, z, total}

  const s2car = sphtocar(theta, phi);
  const Bigrf = pere2_pos([-intensity.z, -intensity.x, intensity.y], s2car);

  return [ Bigrf, intensity.total ];
}

/********************************************
* converts spherical coords into cartesian
* NOTE: at the poles (x=0 and y=0) we assume phi=0 
********************************************/
function sphcar_08_neg(x, y, z) {
  const sq = x*x + y*y;
  let r = Math.sqrt(sq + z*z);

  if (sq !== 0) {
    let phi = Math.atan2(y, x);
    let theta = Math.atan2(Math.sqrt(sq), z);

    if (phi < 0) phi += 2 * Math.PI;
    return [ r, theta, phi ];
  }

  return (z < 0) ? [ r, Math.PI, 0 ] : [ r, 0, 0 ];
}

/********************************************
* Transition A into B vectors by T: B = T * A
********************************************/
function pere2_pos(A, T) {
  return [
    t[0][0] * a[0] + t[0][1] * a[1] + t[0][2] * a[2],
    t[1][0] * a[0] + t[1][1] * a[1] + t[1][2] * a[2],
    t[2][0] * a[0] + t[2][1] * a[1] + t[2][2] * a[2],
  ];
}

/********************************************
* Calculation of the transition matrix from 
* spherical coordinates to cartesian ones
********************************************/
function s2car(theta, phi) {
  const st = Math.sin(theta);
  const ct = Math.cos(theta);
  const sp = Math.sin(phi);
  const cp = Math.cos(phi);

  return [
    [ st * cp, ct * cp, -sf ],
    [ st * sp, ct * sp,  cp ],
    [      ct,     -st,   0 ],
  ]
}
