import { Table, Column, Model, DataType } from 'sequelize-typescript'
import Anime from './anime.model'
import User from './user.model'

@Table({
    tableName: 'AnimeScoreRecords',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})

export default class AnimeScoreRecords extends Model<AnimeScoreRecords> {

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        references: { model: User, key: 'id' }
    }) userID: number

    @Column({
        type: DataType.INTEGER({ length: 20 }),
        references: { model: Anime, key: 'id' }
    }) animeID: number

    @Column({
        type: DataType.INTEGER({ length: 2 }),
    }) score: number

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number
}