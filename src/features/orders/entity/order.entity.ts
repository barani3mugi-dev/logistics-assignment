import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,OneToMany
} from "typeorm"
import { ShipmentStatus } from "src/common/enums/shipment_status.enum"
import { CourierPartner } from "src/common/enums/courier_partner.enum"
import { TrackingHistory } from "src/features/tracking_history/entity/tracking_history.entity";


@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    externalOrderId: string;

    @Column()
    courierPartner: string;

    @Column({ nullable: true })
    courierOrderId: string;        

    @Column({ nullable: true })
    awbNumber: string;       

    @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.CREATED })
    status: ShipmentStatus;

    @Column({ type: 'jsonb', nullable: true })
    requestPayload: object;     

    @Column({ type: 'jsonb', nullable: true })
    responsePayload: object;     

    @Column({ nullable: true, type: 'varchar' })
    batchId: string | undefined;   

    @Column({ nullable: true })
    failureReason: string;

    @OneToMany(() => TrackingHistory, (t) => t.order, { cascade: true })
    trackingHistory: TrackingHistory[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

