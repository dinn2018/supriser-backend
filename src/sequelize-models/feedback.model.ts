import { Table, Column, Model, DataType, Default, AllowNull } from 'sequelize-typescript'

@Table({
    tableName: 'Feedback',
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
        type: DataType.INTEGER({ length: 32 }),
    }) userId: number

    @Default('')
    @AllowNull(false)
    @Column({
        type: DataType.STRING(2000),
    }) content: string

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number
}