import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
export class Bid {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    auction_id: number

    @Column()
    current_amount: number

    @Column({default: 0})
    isDeleted: number
}