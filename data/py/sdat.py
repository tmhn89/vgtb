from __future__ import division

import math
import numpy
import os
import csv

from scipy.stats import gamma

import pdb

def test(filename, scale):
    precip_vector = []
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        # next(reader)
        for row in reader:
            precip_vector.append(float(row[0]))


    pdb.set_trace()

# calculate spi from vector of monthly rainfall
def spi(precip_vector, scale):
    # take current month
    # sum up monthly rain by scale
    # make a rains vector of only that month throughout all the years
    rains_by_scale = dict.fromkeys(range(1,13),[])

    for rownum, data in enumerate(precip_vector):
        scaledata = 0
        if rownum+1-scale >= 0:
            for i in range(0,scale):
                scaledata += precip_vector[rownum-i]
        month = 12 if (rownum+1)%12 == 0 else (rownum+1)%12
        rains_by_scale[month] = rains_by_scale[month] + [scaledata]

    spis = dict.fromkeys(range(1,13),[])
    for month, rains in rains_by_scale.iteritems():

        missing = [rain for rain in rains if rain == 0]
        num_valid = len(rains)-len(missing)

        # if no data provided in that grid
        if num_valid > 0:
            lns = []
            for rain in rains:
                lns.append(numpy.log(rain))

            # average rain
            avg_rain = numpy.sum(rains)/num_valid
            # average lns
            avg_ln = numpy.log(avg_rain)
            # sum lns
            sum_ln = sum_only_num(lns)
            a = avg_ln-(sum_ln/num_valid)
            alpha = (1./4)/a*(1+math.sqrt(1+4*a/3))
            beta = avg_rain/alpha

            # gamma distribution
            cdfs = []
            q = float(len(missing))/float(len(rains))
            for rain in rains:
                cdfs.append(q+(1-q)*gamma.cdf(rain,alpha,loc=0,scale=beta))

            # t and z
            c0 = 2.515517
            c1 = 0.802583
            c2 = 0.010328
            d1 = 1.432788
            d2 = 0.189269
            d3 = 0.001308
            ts = []
            spi = []
            for cdf in cdfs:
                if 0 < cdf <= 0.5:
                    t = math.sqrt(numpy.log(1/cdf**2))
                    z = - (t - (c0+c1*t+c2*t**2)/(1+d1*t+d2*t**2+d3*t**3))
                else:
                    t = math.sqrt(numpy.log(1/(1-cdf)**2))
                    z = t - (c0+c1*t+c2*t**2)/(1+d1*t+d2*t**2+d3*t**3)
                spi.append(z)
            spis[month] = spi
        else:
            spis[month] = [0] * len(rains)

    return spis

#read spi from file
def spif(filename,scale):
    rains = []
    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile)
        # next(reader)
        for row in reader:
            rains.append(float(row[0]))
    return spi(rains, scale)


def sum_only_num(arr):
    sum = 0
    for val in arr:
        if not math.isnan(val):
            if not math.isinf(val):
                sum += val
    return sum
