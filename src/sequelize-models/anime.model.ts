import { Table, Column, Model, DataType } from 'sequelize-typescript'

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
        type: DataType.STRING(1000),
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
        type: DataType.INTEGER({ length: 64 }),
    }) totalScore: number

    @Column({
        type: DataType.INTEGER({ length: 64 }),
    }) scoreCount: number

    @Column({
        type: DataType.INTEGER({ length: 2 }),
    }) score: number
}