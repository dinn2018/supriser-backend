import { Sequelize } from 'sequelize-typescript';
import Episode from './episode.model';
import Anime from './anime.model';
import Cartoon from './cartoon.model';
import CartoonNum from './cartoonnum.model';
import CartoonSeries from './cartoonseries.model';
import Comment from './comment.model';
import User from './user.model';

let sequelize: Sequelize;
if (!process.env.NODE_ENV || process.env.NODE_ENV == "dev") {
    sequelize = new Sequelize({
        database: 'supriser',
        dialect: 'mysql',
        host: 'localhost',
        username: 'root',
        password: '123456qwe',
        models: [Anime, Episode, Cartoon, CartoonNum, CartoonSeries, User, Comment]
    });
} else {
    sequelize = new Sequelize({
        database: process.env.DBNAME,
        dialect: 'mysql',
        host: process.env.DBHOST,
        username: process.env.DBUSER,
        password: process.env.DBPASS,
        models: [Anime, Episode, Cartoon, CartoonNum, CartoonSeries, User, Comment]
    });
}

export { sequelize }