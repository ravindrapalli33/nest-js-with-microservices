import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, BeforeUpdate } from 'typeorm'
import * as crypto from 'crypto'
import { UserStatus } from 'shared/constant/user.status.enum';
import { Role } from 'shared/constant/role.enum';
import { AuditEntity } from 'shared/constant/audit.entity';

@Entity('app_user')
export class User extends AuditEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name' })
    @ApiProperty()
    firstName: string;

    @Column({ name: 'last_name' })
    @ApiProperty()
    lastName: string;

    @Column({ name: 'username', unique: true })
    @ApiProperty()
    username: string;

    @Column({
        type: 'enum',
        name: 'status',
        enum: UserStatus,
        default: UserStatus.INACTIVE
    })
    @ApiProperty()
    status: UserStatus;

    @Exclude()
    @Column({
        type: 'text',
        name: 'password'
    })
    @ApiProperty()
    password: string;

    @Exclude()
    @Column({
        type: 'text',
        name: 'salt'
    })
    @ApiProperty()
    salt: string;

    @Column({
        type: 'text',
        array: true,
        name: 'roles',
        default: [ Role.User ]
    })
    roles: Role[];

    @Column({
        name: 'failed_login_attemps',
        default: 0
    })
    @ApiProperty()
    failedLoginAttempts: number;

    @Column({
        name: 'last_login_attempt',
        nullable: true
    })
    lastLoginAttempt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    private async hashPasswordChange() {
        if (this.password) {
            this.password = crypto.pbkdf2Sync(this.password, this.salt, 10000, 512, 'sha512').toString('hex');
        }
    }
}
