//env
require('dotenv').config();

// create server
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const ejs = require('ejs');
app.set('view engine', 'ejs')

const xml2js = require('xml2js');

//connect MongoDB
var database;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
    process.env.MONGODB_URL,
    { useUnifiedTopology: true },
    function (err, client) {     //callback function    
        if (err) {
            return console.log('connection err : ' + err);
        }
        database = client.db('test-database01');
        app.listen(8080, function () {
            console.log('connected : listening on 8080')
        })

    });

const path = require('path');
const openApiKey = process.env.openAPI_KEY;
const http = require('http');

app.get('/', function (request, response) {
    response.render(path.join(__dirname, 'views', 'map.ejs'), { areaName: '' });
});

app.get('/API', function (req, res) {
    res.render(path.join(__dirname, 'views', 'map.ejs'), { areaName: '' });
});


app.get('/API/2', function (req, res) {
    console.log('start')
    const area_cd = "POI072";
    const url = 'http://openapi.seoul.go.kr:8088/' + openApiKey + '/xml/citydata/1/1/' + area_cd;
    http.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log('api응답 받음')

            //xml parsing
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    console.error('XML 파싱 오류', err);
                    res.status(500).send('XML 파싱 오류');
                    return;
                }
                const areaName = result['SeoulRtd.citydata']['CITYDATA'][0]['AREA_NM'][0];
                const areaCongestLevel = result['SeoulRtd.citydata']['CITYDATA'][0]['LIVE_PPLTN_STTS'][0]['LIVE_PPLTN_STTS'][0]['AREA_CONGEST_LVL'][0];
                const areaCongestMessage = result['SeoulRtd.citydata']['CITYDATA'][0]['LIVE_PPLTN_STTS'][0]['LIVE_PPLTN_STTS'][0]['AREA_CONGEST_MSG'][0];
                const time = result['SeoulRtd.citydata']['CITYDATA'][0]['LIVE_PPLTN_STTS'][0]['LIVE_PPLTN_STTS'][0]['PPLTN_TIME'][0];
                console.log('지역명:', areaName);
                console.log('혼잡도:', areaCongestLevel);
                console.log('설명:', areaCongestMessage);
                console.log('기준시간:', time);
                res.render(path.join(__dirname, 'views', 'map.ejs'), {
                    areaName: areaName,
                    areaCongestLevel: areaCongestLevel,
                    areaCongestMessage: areaCongestMessage,
                    time: time
                });
            })
        });
    }).on('error', (error) => {
        console.log('API 요청 중 오류 발생:', error);
    })
})