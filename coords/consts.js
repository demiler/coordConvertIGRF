const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

const FLATTENING = 1 / 298.257;

const Earth = Object.freeze({
  radius: Object.freeze({
    equatorial: 6378.137,
    polar:      6356.752,
    mean:       6371.200,
    core:       3485.000,
  }),
});

module.exports = { Earth, MILLIS_PER_DAY, FLATTENING };
