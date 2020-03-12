import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
    tableName: 'Cartoon',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class Cartoon extends Model<Cartoon> {

    @Column({
        type: DataType.INTEGER({ length: 20 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.STRING(100),
        unique: { name: 'name', msg: 'name' }
    }) name: string

    @Column({
        type: DataType.STRING(100),
    }) poster: string

    @Column({
        type: DataType.STRING(10000),
    }) description: string

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number


}