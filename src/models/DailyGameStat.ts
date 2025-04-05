import {Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class DailyGameStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({length: 200})
  playId: string;

  @Column()
  tryNumber: number;

  @Column({default: 1})
  count: number;

  @CreateDateColumn()
  createdAt: Date;
}