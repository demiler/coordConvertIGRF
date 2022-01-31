#!/usr/bin/python
# -*- coding: utf-8 -*-
"""PySatel - a Python framework for automated processing of space satellite scientific data
   Copyright (C)
        2012 Wera Barinova

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program. If not, see <http://www.gnu.org/licenses/>.
"""

# from scipy import sqrt, pi, mat, cos, sin, arctan, arctan2, tan, radians
# from datetime import datetime, timedelta
# from coordinates.tlebase import getPathToTle, prepareTleBase
# from coordinates.predict import latlonalt
# from calendar import timegm
# from sys import argv

# # Constants defined by the World Geodetic System 1984 (WGS84)
# a = 6378.137                 # Equatorial Earth Radius
# b = 6356.7523142             # Polar Earth Radius
# esq = 6.69437999014 * 0.001
# e1sq = 6.73949674228 * 0.001
# f = 1/298.257223563

# gnss = "Global Navigation Satellite Systems (GNSS)"

# def geodetic2ecef(lat, lon, alt): # input is degrees
    # # geographic coordinates from geodetic
    # lat, lon = radians(lat), radians(lon)
    # # local constants optimization
    # # esq = 2*f - f*f = eccentricity square
    # coslat = cos(lat)
    # sinlat = sin(lat)
    # xi = sqrt(1 - esq * sinlat * sinlat)
    # axi = a/xi
    # x  = (axi + alt) * coslat * cos(lon)
    # y  = (axi + alt) * coslat * sin(lon)
    # z  = (axi * (1 - esq) + alt) * sinlat
    # lat_ecf = arctan(sqrt(1 - esq) * tan(lat)) # arctan2?
    # lon_ecf = lon
    # r  = sqrt(x*x + y*y + z*z)
    # return x, y, z, lat_ecf, lon_ecf, r

# def main(argv):
    # """Returns lat, lon and alt in one tle in one txt
# geo.py noradid [start [end [resolution]]]
# geo.py noradid                      : coord for current dt
# geo.py noradid start                : one date
# geo.py noradid start end            : list of strings with 1 second between
# geo.py noradid start end resolution : list of strings with resolution in seconds
# formats for date and time: YYYY-MM-DDThh:mm:ss
# """
    # help = """Returns lat, lon and alt in one tle in one txt
# geo.py noradid [start [end [resolution]]]
# geo.py noradid                      : coord for current dt
# geo.py noradid start                : one date
# geo.py noradid start end            : list of strings with 1 second between
# geo.py noradid start end resolution : list of strings with resolution in seconds
# formats for date and time: YYYY-MM-DDThh:mm:ss
# """
    # if len(argv) < 2:
        # print help + "Stop."
        # return ""
    # noradid = None
    # try:
        # noradid = int(argv[1])
    # except:
        # print help + "Stop."
        # return ""
    # dt = datetime.now()
    # if len(argv) > 2:
        # try:
            # dt = datetime.strptime(argv[2], "%Y-%m-%dT%H:%M:%S")
        # except:
            # print help
    # dtend = datetime.now()
    # if dt > dtend:
        # dtend = dt
    # if len(argv) > 3:
        # try:
            # dtend = datetime.strptime(argv[3], "%Y-%m-%dT%H:%M:%S")
        # except:
            # print help
    # resolution = 1
    # if len(argv) > 4:
        # try:
            # resolution = int(argv[4])
        # except:
            # print help
    # dtList = []
    # while dt <= dtend:
        # dtList.append(dt)
        # dt += timedelta(seconds = resolution)
    # tles = prepareTleBase(noradid, dtList)

    # result = '"YYYY-MM-DD hh:mm:ss","Xgeo","Ygeo","Zgeo","lat","lon","alt"\n'
    # for dt in dtList:
        # lat, lon, alt = latlonalt(getPathToTle(dt, tles), timegm(dt.utctimetuple()))
        # x, y, z, lat_ecf, lon_ecf, r = geodetic2ecef(lat, lon, alt)
        # result += dt.strftime('"%Y-%m-%d %H:%M:%S"') + ',"%.3f","%.3f","%.3f","%.3f","%.3f","%.3f"\n' % (
            # x, y, z, lat, lon, alt
        # )
    # return result


if __name__ == "__main__":
    print(f'"YYYY-MM-DD hh:mm:ss","Xgeo","Ygeo","Zgeo","lat","lon","alt"')
    for i in range(10_000):
        print(f'"2019-11-26 12:00:00","-1318.900","-2700.312","6526.422","65.405","243.968","824.599"')
        print(f'"2019-11-26 12:00:01","-1324.261","-2704.726","6523.515","65.350","243.913","824.590"')
