import * as pg from 'pg';

export class PostgreService{
    client: pg.Client;
    conString = "postgres://postgres:1234@localhost:5432/pdtgis";
    constructor() {     
    }

    public async getResult(){
        
        this.client = new pg.Client(this.conString);
        await this.client.connect();
        const res = await this.client.query('SELECT $1::text as message', ['Hello world!'])
        console.log(res.rows[0].message) // Hello world!
        await this.client.end()
    }

    public async getAllShops(){
        this.client = new pg.Client(this.conString);
        await this.client.connect();
        const res = await this.client.query('SELECT name, geojson, ST_AREA(way) as area FROM shops ORDER BY area DESC')
        await this.client.end()
        return res.rows;
    }

    public async getAllShopsWithinDistance(lat: number, long: number, radius: number = 10000){
        this.client = new pg.Client(this.conString);
        this.allShopsWithinDistance.values = [long, lat, radius];
        await this.client.connect();
        const res = await this.client.query(this.allShopsWithinDistance)
        await this.client.end();
        return res.rows;
    }

    public async getAllShopsInMall(mallName: string){
        this.client = new pg.Client(this.conString);
        this.shopsInMall.values = [mallName];
        await this.client.connect();
        const res = await this.client.query(this.shopsInMall)
        await this.client.end();
        return res.rows;
    }

    public async getParkingLots(){
        this.client = new pg.Client(this.conString);
        await this.client.connect();
        const res = await this.client.query(this.parkingLots)
        await this.client.end();
        return res.rows;
    }

    //Queries with placeholder values
    shopsInMall = {
        name: 'shops-in-mall',
        text: 'SELECT name, ST_AsGeoJSON(ST_Transform(way, 4326))::json as geojson FROM planet_osm_point WHERE ST_WITHIN(way, (SELECT way FROM public.shops WHERE name = $1::text LIMIT 1))',
        values: ["Aupark"]
    }

    allShopsWithinDistance = {
        name: 'fetch-shops-near',
        text: 'SELECT name, geojson FROM public.shops'
        + ' WHERE ST_DistanceSphere(ST_TRANSFORM(way,4326), ST_MakePoint($1, $2)) <= $3',
        values: [1,1,1]
    }

    parkingLots = {
        name: 'fetch-parking',
        text: 'SELECT name, st_asgeojson(ST_Transform(way, 4326))::json as geojson FROM public.ways_parking'
    }



}