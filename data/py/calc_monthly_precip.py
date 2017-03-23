import os
import csv
import calendar
import collections

import pdb

def calc(year, month):
    result = {}
    # fetch all file with year and month from jaxa_daily
    data_dir = '../jaxa_daily/'
    for root, dirs, files in os.walk(os.path.join(data_dir)):
        for f in files:
            fileyear = f[0:4]
            if fileyear == year:
                filemonth = f[4:6]
                if filemonth == month:
                    # process file
                    print('processing file:' + f)
                    with open(root + '/' + f, 'r') as csvfile:
                        reader = csv.reader(csvfile)
                        next(reader)
                        for row in reader:
                            lat = row[0].strip()
                            lon = row[1].strip()
                            pos = lat + ',' + lon

                            # fetch lat&lon
                            if result.has_key(pos):
                                # store an array of sum rain rate for each lat,lon
                                result[pos] = result[pos] + (float(row[2].strip())/24)
                            else:
                                result[pos] = 0

    # write into file in jaxa/[year]/[year][month].csv
    filename = '../jaxa/' + year + '/' + year + month + '.csv'
    writer = open(filename,'w')
    writer.write('lat,lon,rainRate' + '\n')

    ordered_result = collections.OrderedDict(sorted(result.items()))

    for pos, rain in ordered_result.iteritems():
        writer.write(pos + ',' + str(rain) + '\n')

calc('2017', '02')
