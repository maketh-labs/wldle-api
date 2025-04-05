import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Game {
  @PrimaryColumn()
  gameId: string;

  @Column()
  player1: string;

  @Column({ nullable: true })
  player2: string | null;

  @Column()
  resolver: string;

  @Column()
  token: string;

  @Column("decimal", { precision: 36, scale: 18 })
  amount: string;

  @Column("decimal", { precision: 36, scale: 18 })
  fee: string;

  @Column({ default: false })
  settled: boolean;

  @Column({ nullable: true })
  answer: string | null;

  @Column({ default: false })
  player1Completed: boolean;

  @Column({ default: false })
  player2Completed: boolean;

  @Column({ nullable: true })
  player1Tries: number | null;

  @Column({ nullable: true })
  player2Tries: number | null;

  @Column({ nullable: true })
  player1Green: number | null;

  @Column({ nullable: true })
  player2Green: number | null;

  @Column({ nullable: true })
  player1Blue: number | null;

  @Column({ nullable: true })
  player2Blue: number | null;

  @Column({ nullable: true })
  winner: string | null;

  @Column({ nullable: true })
  signature: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 