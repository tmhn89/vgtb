import os
import csv
import calendar

import pdb

data_dir = '../jaxa'
out_dir = '../jaxa_monthly'
for root, dirs, temp_f in os.walk(os.path.join(data_dir)):
    for dir in dirs:
        for temp_r, temp_d, files in os.walk(os.path.join(data_dir, dir)):
            for file in files:
                if file[0].isdigit():
                    with open(root + '/' + dir + '/' + file, 'r') as csvfile:
                        reader = csv.reader(csvfile)
                        next(reader)

                        outfile = out_dir + '/' + file
                        writer = open(outfile,'w')
                        writer.write('lat,lon,rainRate\n')
                        for row in reader:
                            lat = row[0].strip()
                            lon = row[1].strip()
                            # convert mm/hr to mm/month
                            precip = str(float(row[2]) * 24)
                            writer.write(lat + ',' + lon + ',' + precip + '\n')
