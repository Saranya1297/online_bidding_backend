import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Auction {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    starting_bid: Date

    @Column()
    end_date: Date

    @Column({default: 0})
    isDeleted: number
}