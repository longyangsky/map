/*
This module is under MIT License (MIT)
Copyright <2015> <Zheng Wang>
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
# Krasovsky 1940
#
# a = 6378245.0, 1/f = 298.3
# b = a * (1 - f)
# ee = (a^2 - b^2) / a^2
*/

var math = require('mathjs');
var pi = 3.14159265358979324;

// Mars Geodetic System ==> BD-09 Geodetic System

exports.BDTransform = function bd09transform(wgLat, wgLon){
    var MarsGS = JSON.parse(transform(wgLat, wgLon)); 

    var x = MarsGS.Lon;
    var y = MarsGS.Lat;
    
    var z = math.sqrt(x * x + y * y) + 0.00002 * math.sin(y * pi);
    var theta = Math.atan2(y, x) + 0.000003 * math.cos(x * pi);
    var bd_lon = z * math.cos(theta) + 0.0065;
    var bd_lat = z * math.sin(theta) + 0.006;

    return JSON.stringify({"Lat":bd_lat, "Lon":bd_lon}); 
}

// World Geodetic System ==> Mars Geodetic System

exports.MarsTransform = function GCJTransform(wgLat, wgLon){
   return transform(wgLat,wgLon);
}


function transform(wgLat, wgLon){
    //transform(latitude,longitude) , WGS84
    //return (latitude,longitude) , GCJ02

    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    
    if (outOfChina(wgLat, wgLon)){

        return {Lat:this.wgLat, Lon:this.wgLon}; 
    }

    var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
    var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
    var radLat = wgLat / 180.0 * pi;

    var magic = math.sin(radLat);
    magic = 1 - ee * magic * magic;

    var sqrtMagic = math.sqrt(magic);

    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi)
    dLon = (dLon * 180.0) / (a / sqrtMagic * math.cos(radLat) * pi)
    var mgLat = wgLat + dLat;
    var mgLon = wgLon + dLon;

    return JSON.stringify({"Lat":mgLat, "Lon":mgLon}); 
}

function outOfChina(lat, lon){

    if (lon < 72.004 || lon > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
}

function transformLat(x, y){

    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(math.abs(x));
    ret += (20.0 * math.sin(6.0 * x * pi) + 20.0 * math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * math.sin(y * pi) + 40.0 * math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * math.sin(y / 12.0 * pi) + 320 * math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret
}

function transformLon(x, y){
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(math.abs(x));
    ret += (20.0 * math.sin(6.0 * x * pi) + 20.0 * math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * math.sin(x * pi) + 40.0 * math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * math.sin(x / 12.0 * pi) + 300.0 * math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

exports.test = function test(){
    var WGS84_Lat = 39.990205;
    var WGS84_Long = 116.327847;
    return this.transform(WGS84_Lat,WGS84_Long);
}

 //this.ctx.logger.info('schedule getResourceByKJPT finish') 
    // this.ctx.logger.info('schedule getResourceByKJPT begin')   
    /*var WGS84_Lat = 30.669880;
    var WGS84_Lon = 112.9521427133; 
    console.log('WG_lat, WGS84_Lon:' + WGS84_Lat +',' +WGS84_Lon);
    console.log('Translated:');
    console.log(translator.MarsTransform(WGS84_Lat,WGS84_Lon));
    console.log('BD-09 Translated:');
    console.log(translator.BDTransform(WGS84_Lat,WGS84_Lon));*/