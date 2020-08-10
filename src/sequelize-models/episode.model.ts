import { Table, Column, Model, DataType } from 'sequelize-typescript'
import Anime from './anime.model'

@Table({
    tableName: 'Episode',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class Episode extends Model<Episode> {

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.STRING(200),
        // unique: { name: 'url', msg: 'url' }
    }) url: string

    @Column({
        type: DataType.STRING(200),
        // unique: { name: 'downloadUrl', msg: 'downloadUrl' }
    }) downloadUrl: string

    @Column({
        type: DataType.STRING(200),
        // unique: { name: 'webUrl', msg: 'webUrl' }
    }) webUrl: string

    @Column({
        type: DataType.STRING({ length: 20 }),
    }) num: string

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        references: { model: Anime, key: 'id' }
    }) animeID: number

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number


}