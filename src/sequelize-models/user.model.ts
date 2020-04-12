import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
    tableName: 'User',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
})
export default class User extends Model<User> {

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
    }) passHash: string

    @Column({
        type: DataType.STRING(100),
        unique: { name: 'email', msg: 'email' }
    }) email: string

    @Column({
        type: DataType.DOUBLE,
    }) updateTime: number


}