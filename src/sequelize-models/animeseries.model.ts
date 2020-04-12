import { Table, Column, Model, DataType } from 'sequelize-typescript'
import Anime from './anime.model'

@Table({
    tableName: 'AnimeSeries',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class AnimeSeries extends Model<AnimeSeries> {

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.STRING(200),
        unique: { name: 'url', msg: 'url' }
    }) url: string

    @Column({
        type: DataType.INTEGER({ length: 12 }),
    }) num: number

    @Column({
        type: DataType.INTEGER({ length: 1 }),
    }) onlyVIP: number

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        references: { model: Anime, key: 'id' }
    }) animeID: number

}