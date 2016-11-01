## Precitipation data: NASA's Earthdata
Using [TRMM monthly precitipation data - TRMM_3B43](http://disc.gsfc.nasa.gov/uui/datasets/TRMM_3B43_V7/summary?keywords=TRMM_3B43_007) (grid 0.25x0.25)

Check also GPM_3IMERGM dataset (grid 0.1x0.1)
(data citation in the same link)

rectangle: 15.04,107.24,16.16,108.66

format: netCDF

## Data processing:
Limit data in VGTB area using [Simple Subset Wizard](http://disc.gsfc.nasa.gov/SSW/#keywords=TRMM_3B43)

Download all data for different date time using [Perl](http://disc.sci.gsfc.nasa.gov/ssw/documentation/SSW_URL_List_Downloading_Instructions.html)

Use CSS clip-path to limit graph within VGTB river basin

Use Thiessen Polygon Delineation to determine station catchment

## SPI calculation:
[SPI package in R](https://cran.r-project.org/web/packages/spi/index.html)

Try to use SDAT when R not work

___

## Precitipation data using JAXA
ftp://hokusai.eorc.jaxa.jp/realtime/txt/02_AsiaSE

format: CSV, from 09/2014~present

format: Grads binary, from 2008~present

[Convert grads file to text](http://gradsaddict.blogspot.fi/2013/05/tutorial-how-to-save-data-into-txt.html)

## Data processing
Unzip & cut down needed rows [using terminal](http://bconnelly.net/working-with-csvs-on-the-command-line/)
