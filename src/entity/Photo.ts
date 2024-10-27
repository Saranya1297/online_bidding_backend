import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 100
    })
    name: string

    @Column()
    description: string

    @Column()
    fileName: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}