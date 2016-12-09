import os
import csv
import collections
import sys
import re
from datetime import datetime
import math

year = sys.argv[1]
month = sys.argv[2]
day = sys.argv[3]

def start(year, month, day):
    date = ''.join([year, month, day])
    db = {}
    dir = os.listdir('./')
    for file in dir:
        if file.endswith('.csv') and date in file:
            with open(file) as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    lat = str(math.ceil(float(row[0].strip()) * 10) / 10)
                    lon = str(math.ceil(float(row[1].strip()) * 10) / 10)
                    if inrange(lat,lon):
                        precip = float(row[2].strip())

                        pos = ','.join([lat, lon])
                        if not db.has_key(pos):
                            db[pos] = 0
                        db[pos] += precip

    writer = open('jaxa_daily/' + date + '.csv', 'w')
    writer.write('lat,lon,rainRate\n')

    sdb = collections.OrderedDict(sorted(db.items()))

    for pos, precip in sdb.items():
        writer.write(','.join([pos, '%.2f' % precip]) + '\n')

def inrange(lat,lon):
    latmin = 14
    latmax = 16.5
    lonmin = 107
    lonmax = 109

    flat = float(lat)
    flon = float(lon)

    if latmin < flat < latmax and lonmin < flon < lonmax:
        return True

    return False

start(year, month, day)
