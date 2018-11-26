import * as express from 'express';
import { PostgreService } from './pgService';
var path = require('path');

const app = express();
const pgService = new PostgreService();

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

app.listen(8000, () => {
    console.log('Server started!');
});

app.get('/api/allshops', asyncMiddleware(async (req, res, next) => {
    const shops = await pgService.getAllShops()
    res.json(JSON.stringify(shops));
}));


app.get('/api/allshops/:lat/:lon/:radius', asyncMiddleware(async (req, res, next) => {
    const shops = await pgService.getAllShopsWithinDistance(req.params.lat, req.params.lon, req.params.radius)
    res.json(JSON.stringify(shops));
}));


app.get('/api/mall/:name', asyncMiddleware(async (req, res, next) => {
    const shops = await pgService.getAllShopsInMall(req.params.name)
    res.json(JSON.stringify(shops));
}));

app.get('/api/parking', asyncMiddleware(async (req, res, next) => {
    const parking = await pgService.getParkingLots()
    res.json(JSON.stringify(parking));
}));


// Serve html
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/frontend/index.html'));
});

// Serve js, css
app.use(express.static('leaflet'));