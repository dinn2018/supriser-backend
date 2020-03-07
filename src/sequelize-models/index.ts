import { Sequelize } from 'sequelize-typescript';
import AnimeSeries from './animeseries.model';
import Anime from './anime.model';

let sequelize: Sequelize;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "dev") {
    sequelize = new Sequelize({
        database: 'supriser',
        dialect: 'mysql',
        host: 'localhost',
        username: 'root',
        password: '123456qwe',
        models: [Anime, AnimeSeries,]
    });
} else {
    sequelize = new Sequelize({
        database: 'supriser',
        dialect: 'mysql',
        host: '127.0.0.1',
        username: 'root',
        password: 'vechain@faucet!',
        models: [Anime, AnimeSeries,]
    });
}

export { sequelize }