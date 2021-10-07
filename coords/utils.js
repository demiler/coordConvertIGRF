const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

/*****************************************************
* converts yyyy/mm/dd to dayID - day number in year
* as yyyy/01/01 = 1, yyyy/02/10 = 41 and so on
* mm in [1, 12] range
******************************************************/
function dayInYear(year, month, day) {
  const now   = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  return Math.floor((now - start) / MILLIS_PER_DAY);
}

function radians(degree) {
  return degree * (Math.PI / 180);
}

module.exports = { dayInYear };
