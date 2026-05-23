import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Order } from 'src/features/orders/entity/order.entity';

@Entity('tracking_history')
export class TrackingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.trackingHistory)
  @JoinColumn({ name: 'order_id' })
  order: Order;


  @Column()
  status: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload: object;           // raw response from courier at this point

  @Column({ nullable: true })
  courierTimestamp: string;     // timestamp courier reported

  @CreateDateColumn()
  recordedAt: Date;           
}