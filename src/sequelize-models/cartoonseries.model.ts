import { Table, Column, Model, DataType } from 'sequelize-typescript'
import CartoonNum from './cartoonnum.model'

@Table({
    tableName: 'CartoonSeries',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class CartoonSeries extends Model<CartoonSeries> {

    @Column({
        type: DataType.INTEGER({ length: 20 }),
        primaryKey: true,
        autoIncrement: true,
    }) id: number

    @Column({
        type: DataType.STRING(200),
        unique: { name: 'url', msg: 'url' }
    }) url: string

    @Column({
        type: DataType.STRING(50),
    }) num: string

    @Column({
        type: DataType.INTEGER({ length: 20 }),
        references: { model: CartoonNum, key: 'id' }
    }) cartoonNumID: string

}