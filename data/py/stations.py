import os
import csv
import calendar

import sdat

import pdb

def filterList(list, attr, val):
    return [item for item in list if item[attr] == val]

def start():
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

    # exportPrecipVectorByPos(db)

    # for testing
    #spif = sdat.spif('../stations/precip_vector/15.445_107.7936111.txt',6)

    time_scales = [1,3,6,12]
    for scale in time_scales:
        runSPICalculator(scale,db)

def exportPrecipVectorByPos(db):
    # write to lat_lon.txt files
    for pos in db.keys():
        filename = '../stations/precip_vector/' + pos + '.txt'
        writer = open(filename,'w')
        # create file
        for year in range(2000, 2015):
            for month in range(1,13):
                record_in_month = [record for record in db[pos] if int(record['month']) == month and int(record['year']) == year]
                if len(record_in_month) == 0:
                    # writer.write(record_in_month[0]['month'] + ',' + record_in_month[0]['year'] + ',' + '0' + '\n')
                    writer.write('0' + '\n')
                else:
                    # writer.write(record_in_month[0]['month'] + ',' + record_in_month[0]['year'] + ',' + record_in_month[0]['precip'] + '\n')
                    writer.write(record_in_month[0]['precip'] + '\n')

def exportPrecipVectorByPosAndMonth(db):
    # write to lat_lon.txt files
    for pos in db.keys():
        # create file
        for month in range(1,13):
            filename = '../stations/precip_vector/' + pos + '_' + str(month) + '.txt'
            writer = open(filename,'w')
            for year in range(2000, 2015):
                record_in_month = [record for record in db[pos] if int(record['month']) == month and int(record['year']) == year]
                if len(record_in_month) == 0:
                    writer.write('0' + '\n')
                else:
                    writer.write(record_in_month[0]['precip'] + '\n')

def runSPICalculator(scale, db):
    years = range(2000, 2015)
    final = {}
    for pos in db.keys():
        lat = pos.split('_')[0]
        lon = pos.split('_')[1]
        station = getStationName(lat,lon)

        if station:
            station_name = station[0]['name']
        else:
            station = 'station not found'
        # obtain spi by station file
        spif = sdat.spif('../stations/precip_vector/'+pos+'.txt',scale)

        # temp = []
        for month, spis in spif.iteritems():
            for index, spi in enumerate(spis):
                time = str(years[index]) + '_' + str(month)
                # temp.append({'month':month,'year':years[index],'spi':spi})
                row = station_name + ',' + lat + ',' + lon + ',' + str(spi)
                if not final.has_key(time):
                    final[time] = []
                final[time].append(row)

    for time, filecontent in final.iteritems():
        writer = open('../stations/spi/'+str(scale)+'/'+time+'.csv','w')
        writer.write('name,lat,lon,spi\n')

        for row in filecontent:
            writer.write(row + '\n')


### Return a list of months from year_start to year_end
### each list item has key = month_year, blank value
def getMonthList(year_start, year_end):
    month_list = []
    for year in range(year_start,year_end+1):
        for month in range(1,13):
            key = str(year) + '_' + str(month)
            month_list.append({key : 'name,lat,lon,spi\n'})
    return month_list

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

def getStationName(lat,lon):
    return [station for station in stationDB if station['lat'] == str(lat) and station['lon'] == str(lon)]

start()
