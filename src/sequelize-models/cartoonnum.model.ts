import { Table, Column, Model, DataType } from 'sequelize-typescript'
import Cartoon from './cartoon.model'

@Table({
    tableName: 'CartoonNum',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class CartoonNum extends Model<CartoonNum> {

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
        type: DataType.INTEGER({ length: 32 }),
        references: { model: Cartoon, key: 'id' }
    }) cartoonoID: number

}