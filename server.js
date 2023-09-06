//env
require('dotenv').config();

// create server
const express = require('express');
const app = express();

//set project
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//library
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');

const xml2js = require('xml2js');

const ejs = require('ejs');
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use('/script', express.static(__dirname+'/public/js'));

//set & connect MongoDB
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
const http = require('http');
const openApiKey = process.env.openAPI_KEY;

app.get('/', function (request, response) {
    response.render(path.join(__dirname, 'views', 'map.ejs'), { areaName: '' });
});

app.get('/API', function (req, res) {
    res.render(path.join(__dirname, 'views', 'map.ejs'), { areaName: '' });
});

app.get('/map', function (req, res) {

    const area_cd = "POI007";
    const url = 'http://openapi.seoul.go.kr:8088/' + openApiKey + '/xml/citydata/1/1/' + area_cd;
    http.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log('api응답 받음\n')
            //save in XML
            fs.writeFile('response.xml', data, (err) => {
                if (err) {
                    console.error('xml저장 중 오류 발생', err);
                    res.status(500).send('xml저장 중 오류 발생');
                    return;
                }
                console.log('응답 저장 완료')
            })

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
                const reqTime = result['SeoulRtd.citydata']['CITYDATA'][0]['LIVE_PPLTN_STTS'][0]['LIVE_PPLTN_STTS'][0]['PPLTN_TIME'][0];
                // const roadAddress = result['SeoulRtd.citydata']['CITYDATA'][0]['LIVE_PPLTN_STTS'][0]['LIVE_PPLTN_STTS'][0]['ROAD_ADDR'][0];

                const latitude = 37.12345;  // 원하는 위도 값
                const longitude = 127.56789;  // 원하는 경도 값
                console.log(`
                [지역명] : ${areaName} \n
                [혼잡도] : ${areaCongestLevel} \n
                [설명] : ${areaCongestMessage} \n
                [기준시간] : ${reqTime} \n
            
                `)

                res.render(path.join(__dirname, 'views', 'map.ejs'), {
                    areaName: areaName,
                    areaCongestLevel: areaCongestLevel,
                    areaCongestMessage: areaCongestMessage,
                    time: reqTime,
                    latitude: latitude,  // 위도
                    longitude: longitude  // 경도
                });
            })
        });
    }).on('error', (error) => {
        console.log('API 요청 중 오류 발생:', error);
    })
})