const getters = {
  'geolla':
    [ 'geo.X', 'geo.Y', 'geo.Z' ],
  'geo2LB_Lat_Lon_Alt':
    [ 'l', 'b', 'geod.Lat', 'geod.Lon', 'geod.Alt'],
  'geo2BigrfOnly':
    [ 'magn.X', 'magn.Y', 'magn.Z', 'magn.F' ],
  'geo2RDMLLGsmMltShadOnly':
    [
      'dm.R', 'dm.Lat', 'dm.Lon',
      'gsm.X',  'gsm.Y',  'gsm.Z',
      'mlt', 'shad'
    ],
};

module.exports = getters;
