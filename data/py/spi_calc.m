%  **********       *******                   ***              **************
%  **********       ********                  ***              **************
%   **              **   ****                *****                  ***
%    **             **     ****             *******                 ***
%     **            **       ****          *********                ***
%      **           **        ****        ***    ****               ***
%       **          **        ****      ***       ****              ***
%        **         **       ****      ****************             ***
%         **        **      ****      ******************            ***
%          **       **    ****       ***              ***           ***
%  **********       ********        ***                ***          ***
%  **********       *******        ***                 ****         ***

% Standardized Drought Analysis Toolbox (SDAT)
% This code can be used to generate standardized indicators such as:
% - SPI: Standardized Precipitation Index
% - SSI: Standardized Soil Moisture Index
% - SRI: Standardized Runoff Index
%   (also known as Standardized Streamflow Index, SSFI)
% - SRHI: Standardized Relative Humidity Index
% - SGI: Standardised Groundwater level Index
% - Standardized Surface Water Supply Index (SSWSI)
% - Standardized Water Storage Index (SWSI)

% Input data should be a vector of precipitation, soil moisture, etc.
% sc: scale of the index

% Release 02/01/2015

%Refrences:
%Farahmand A., AghaKouchak A., 2015, A Generalized Framework for Deriving Nonparametric Standardized Drought Indicators, Advances in Water Resources, 76, 140-145, doi: 10.1016/j.advwatres.2014.11.012
%download reference:  http://amir.eng.uci.edu/publications/15_Drought_Standardized_Index_AWR.pdf

%Hao Z., AghaKouchak A., Nakhjiri N., Farahmand A., 2014, Global Integrated Drought Monitoring and Prediction System, Scientific Data, 1:140001, 1-10, doi: 10.1038/sdata.2014.1.
%download reference:  http://www.nature.com/articles/sdata20141

% Please read the disclaimer before using SDAT (Disclaimer.txt). By using SDAT users agree with the disclaimer.

function SI = spi_calc(file, sc)
    td = load(file)
    n=length(td);

    SI=zeros(n,1);

    % Compute the SPI for each grid from the prcp or smc data

    %For some grid, no observation exist.
    if length(td(td>=0))/length(td)~=1
       SI(n,1)=nan;
       else
       % Obtain the prcp and smc for the specified time scale and
       % compute the standarized drought index (for SPI and SSI)
       SI(1:sc-1,1)=nan;

       A1=[];
       for i=1:sc,
       A1=[A1,td(i:length(td)-sc+i)];
       end
       Y=sum(A1,2);

       % Compute the SPI or SSI

        nn=length(Y);
        SI1=zeros(nn,1);

        for k=1:12

        d=Y(k:12:nn);
        %compute the empirical probability
        nnn=length(d);
        bp=zeros(nnn,1);

        for i=1:nnn
        bp(i,1)=sum(d(:,1)<=d(i,1));
        end

        y=(bp-0.44)./(nnn+0.12);

        SI1(k:12:nn,1)=y;
        end

        SI1(:,1)=norminv(SI1(:,1));
        %output
        SI(sc:end,1)=SI1;
end
