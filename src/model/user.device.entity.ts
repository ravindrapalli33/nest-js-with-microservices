import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from 'shared/constant/audit.entity';
import { UserDevicePlatform } from 'shared/constant/user.device.platform.enum';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_device')
export class UserDevice extends AuditEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'token', unique: true })
    @ApiProperty()
    token: string;

    @Column({
        type: 'enum',
        name: 'platform',
        enum: UserDevicePlatform,
        default: UserDevicePlatform.UNKNOWN
    })
    @ApiProperty()
    platform: UserDevicePlatform;

    @ManyToOne(type => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

}
