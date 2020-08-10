import { Table, Column, Model, DataType } from 'sequelize-typescript'
import User from './user.model'
import AnimeSeries from './episode.model'
import CartoonSeries from './cartoonseries.model'

@Table({
    tableName: 'Comment',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class Comment extends Model<Comment> {

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
        type: DataType.STRING(100),
        unique: { name: 'content', msg: 'content' }
    }) content: string

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        references: { model: CartoonSeries, key: 'id' }
    }) cartoonSeriesID: number

    @Column({
        type: DataType.INTEGER({ length: 32 }),
        references: { model: AnimeSeries, key: 'id' }
    }) animeSeriesID: number

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number


}