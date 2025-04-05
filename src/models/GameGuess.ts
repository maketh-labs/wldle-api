import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Game } from "./Game";

@Entity()
export class GameGuess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: string;

  @ManyToOne(() => Game)
  @JoinColumn({ name: "gameId" })
  game: Game;

  @Column()
  player: string;

  @Column()
  guess: string;

  @Column("simple-json")
  pattern: { pattern: ("gray" | "blue" | "green")[], solved: boolean };

  @Column()
  tryNumber: number;

  @CreateDateColumn()
  createdAt: Date;
} 