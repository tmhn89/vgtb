#!/bin/bash
currentDateTs=$(date -j -f "%Y-%m-%d" $1 "+%s")
endDateTs=$(date -j -f "%Y-%m-%d" $2 "+%s")
offset=86400

while [ "$currentDateTs" -le "$endDateTs" ]
do
    day=$(date -j -f "%s" $currentDateTs "+%d")
    month=$(date -j -f "%s" $currentDateTs "+%m")
    year=$(date -j -f "%s" $currentDateTs "+%Y")

    datadir="hokusai.eorc.jaxa.jp/realtime_ver/v7/txt/02_AsiaSE/$year/$month/$day"
    #download from each day
    echo "Start downloading $year/$month/$day data"
    wget -r -q --user=rainmap --password=Niskur+1404 ftp://$datadir -o wget.log
    echo "$year/$month/$day data downloaded. Start unzipping"

    # unzip move to root
    unzip -q $datadir/\*.zip -d $datadir;
    rm -f $datadir/*.zip;

    # process data
    for file in $datadir/*.csv; do
        # cut file, take lat from 14~16.5, lon 107~109
        filename=${file##*/}
        sed -n 68535,76157p $file > $filename
    done
    rm -f $datadir/*.csv;
    python process.py $year $month $day
    rm -f ./*.csv;

    currentDateTs=$(($currentDateTs+$offset))
done
