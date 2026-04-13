import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('cash-flow-management')
export class Finance {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: false })
  user_id: number;

  @Column({ nullable: false })
  type: string; // NAP hoặc RUT , thao tác với dòng tiền 
  
  @Column({ nullable: false })
  amount: number;

  @CreateDateColumn()
  create_at: Date;
}
