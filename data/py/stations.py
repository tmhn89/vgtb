import os
import csv
import calendar
import matlab.engine

import pdb

def filterList(list, attr, val):
    return [item for item in list if item[attr] == val]

def start():
    # get list of stations from file
    stationDB = []
    with open('../stations.csv') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)
        for row in reader:
            record = {
                'name': row[0].strip(),
                'lat': row[1].strip(),
                'lon': row[2].strip()
            }
            stationDB.append(record)

    # database object for 'query' later
    db = {}

    # list all file in folder
    data_dir = '../stations/raw'
    for root, dirs, temp_f in os.walk(os.path.join(data_dir)):
        for dir in dirs:
            for temp_r, temp_d, files in os.walk(os.path.join(data_dir, dir)):
                for file in files:
                    # data file has yyyymm.csv format
                    if file[0].isdigit():
                        duration = file.split('.')[0]
                        year = int(duration[0:4])
                        month = int(duration[4:6])
                        # for each file, read content line by line
                        with open(root + '/' + dir + '/' + file, 'r') as csvfile:
                            reader = csv.reader(csvfile)
                            next(reader)
                            for row in reader:
                                lat = row[0].strip()
                                lon = row[1].strip()
                                precip = float(row[2])

                                pos = lat + '_' + lon
                                row = {
                                    'month': str(month),
                                    'year': str(year),
                                    'precip': str(precip)
                                }

                                if not db.has_key(pos):
                                    db[pos] = []
                                db[pos].append(row)

    exportPrecipVectorByPos(db)
    time_scales = [1,3,6,12]
    for scale in time_scales:
        runSPICalculator(scale, stationDB)

def exportPrecipVectorByPos(db):
    # write to lat_lon.txt files
    for pos in db.keys():
        filename = '../stations/precip_vector/' + pos + '.txt'
        # create file
        writer = open(filename,'w')

        for year in range(2000, 2015):
            for month in range(1,13):
                record_in_month = [record for record in db[pos] if int(record['month']) == month and int(record['year']) == year]
                if len(record_in_month) == 0:
                    writer.write('0' + '\n')
                else:
                    writer.write(record_in_month[0]['precip'] + '\n')

def runSPICalculator(scale, stationDB):
    final_db = getMonthList(2000,2014)

    data_dir = '../stations/precip_vector/'
    me = matlab.engine.start_matlab()
    for root, dirs, files in os.walk(os.path.join(data_dir)):
        # call spi_calc.m here
        for index, filename in enumerate(files):
            # datafile has lat_lon.txt format
            if filename[0].isdigit():
                lat = filename[0:-4].split('_')[0]
                lon = filename[0:-4].split('_')[1]
                sdat = me.spi_calc(root + filename, scale)
                name = getStationName(lat,lon,stationDB)[0]['name']
                # writer = open('../spi/' + filename,'w')
                for row_num, spi in enumerate(sdat):
                    # spi calculated in format [value], need to remove the brackets
                    time = final_db[row_num].keys()[0];
                    final_db[row_num][time] += name + ',' + lat + ',' + lon + ',' + str(spi)[1:-1] + '\n'

    for month_data in final_db:
        writer = open('../stations/spi/' + str(scale) + '/' + month_data.iterkeys().next() + '.csv','w')
        writer.write(month_data.itervalues().next())

### Return a list of months from year_start to year_end
### each list item has key = month_year, blank value
def getMonthList(year_start, year_end):
    month_list = []
    for year in range(year_start,year_end+1):
        for month in range(1,13):
            key = str(year) + '_' + str(month)
            month_list.append({key : 'name,lat,lon,spi\n'})
    return month_list

def getStationName(lat,lon,stationDB):
    return [station for station in stationDB if station['lat'] == str(lat) and station['lon'] == str(lon)]


start()
