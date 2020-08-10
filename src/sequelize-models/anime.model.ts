import { Table, Column, Model, DataType } from 'sequelize-typescript'
import AnimeSeries from './episode.model'
import Episodes from './episode.model'

@Table({
    tableName: 'Anime',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class Anime extends Model<Anime> {

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.STRING(100),
        unique: { name: 'name', msg: 'name' }
    }) name: string

    @Column({
        type: DataType.STRING(100),
    }) status: string

    @Column({
        type: DataType.STRING(100),
    }) director: string

    @Column({
        type: DataType.STRING(500),
    }) actor: string

    @Column({
        type: DataType.STRING(100),
    }) poster: string

    @Column({
        type: DataType.STRING(100),
    }) hdPoster: string

    @Column({
        type: DataType.INTEGER({ length: 12 }),
    }) postYear: number

    @Column({
        type: DataType.STRING(200),
    }) region: string

    @Column({
        type: DataType.STRING(20),
    }) lang: string

    @Column({
        type: DataType.STRING(3000),
    }) description: string

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number

    @Column({
        type: DataType.INTEGER({ length: 1 }),
    }) isRecommended: number

    @Column({
        type: DataType.INTEGER({ length: 1 }),
    }) isForbidden: number

    @Column({
        type: DataType.DECIMAL({ decimals: 32, precision: 0, }),
    }) totalScore: number

    @Column({
        type: DataType.DECIMAL({ decimals: 20, precision: 0, }),
    }) scoreCount: number

    @Column({
        type: DataType.DECIMAL({ decimals: 2, precision: 1, }),
    }) score: number

    @Column({
        type: DataType.DECIMAL({ decimals: 32, precision: 0, }),
    }) hotness: number

    episodeList: Array<AnimeSeries> = []

}