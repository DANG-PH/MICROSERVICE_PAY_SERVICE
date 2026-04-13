import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('pay')
export class Pay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '0' })
  tien: string;

  @Column({ unique: true }) // Unique Index
  userId: number;

  @Column({ default: 'open' })
  status: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
