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
    data_dir = '../jaxa/2016'
    for root, dirs, files in os.walk(os.path.join(data_dir)):
        for file in files:
            if file[0].isdigit():
                with open(root + '/' + file, 'r') as csvfile:
                    reader = csv.reader(csvfile)
                    next(reader)
                    filecontent = 'lat, lon, rainRate\n';
                    # only take grid with station
                    for row in reader:
                        lat = row[0].strip()
                        lon = row[1].strip()
                        stations = getStationByPos(lat,lon,stationGrid)
                        # multiply by 24 to get precip as mm/month
                        if stations:
                            precip = str(float(row[2]) * 24 * 7)
                            for i, station in enumerate(stations):
                                gaugeStation = getStationByName(stations[i]['name'],stationDB)
                                filecontent += gaugeStation[0]['lat'] + ',' + gaugeStation[0]['lon'] + ',' + precip + '\n'

                    # export back to file
                    filename = '../updated_stations/raw/2016/' + file
                    writer = open(filename,'w')
                    writer.write(filecontent)

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

stationGrid = []
with open('../stations_grid.csv') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        record = {
            'name': row[0].strip(),
            'lat': row[1].strip(),
            'lon': row[2].strip()
        }
        stationGrid.append(record)

def getStationByPos(lat,lon,list):
    return [station for station in list if station['lat'] == str(lat) and station['lon'] == str(lon)]

def getStationByName(name,list):
    return [station for station in list if station['name'] == str(name)]

start()
