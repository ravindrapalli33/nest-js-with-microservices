import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class AuditEntity extends BaseEntity {

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_date',
        default: () => 'CURRENT_TIMESTAMP(6)'
    })
    createdDate: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_date',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)'
    })
    updatedDate: Date;
}
