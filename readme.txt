## VGTB rainmap documentation:

### Data

- Data source: Global Rainfall Map in Near Real Time (GSMaP_NRT) from Japan Aerospace Exploration Agency (JAXA)
- Link: ftp://hokusai.eorc.jaxa.jp/realtime_ver/v7/txt/02_AsiaSE (need registration - free)

- File: hourly average precipitation data.
- File format: csv
- Columns: [lat], [lon], [precipitation (mm/hr)]
- Grid resolution: 0.1 degree

=> every day has 24 files

### Uploading data
- Install git
After processing files (as below)
- Open terminal, go to project folder
- switch branch to gh-pages `git checkout gh-pages`
- type `git add .`
- type `git commit -m "update data"`
- type `git push gh-pages`

### Running daily precipitation:
- Open terminal, go to /data folder
- type ./datafetch.sh [day start] [day end]. E.g. ./datafetch.sh 2017-03-03 2017-04-30
- wait for it to finish
- Final file is generated in /data/jaxa_daily folder
(The file automatically download hourly data, keep data in VGTB zone only, and sum all the hourly data in to daily data)

### Running monthly precipitation: (if end of month) (file location and the calculation is quite messy. Will fix it soon)
- Modify the last line of /data/py/calc_monthly_precip.py. Two parameter is year, and month to calculate
- Open terminal, go to /data/py folder.
- type python calc_monthly_precip.py
- Final file is generated in /data/jaxa/[year]/[month] folder

### Running spi calculation (if end of month)
- Open terminal, go to /data/py folder.
- type python grid.py
- Final files are generated in /data/spi folder
(the calculator takes all the file in /data/jaxa folder, and calculating spi 3,6,9,12)
