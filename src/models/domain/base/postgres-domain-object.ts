import {Column} from 'typeorm';
import {EntityStatus} from "../../enums/entity-status";

export abstract class PostgresDomainObject {
    public static build<T extends PostgresDomainObject>(this: new() => T, parameters?: Partial<T>) {
        const instance = new this();
        Object.assign(instance, parameters);
        return instance;
    }

    @Column() public status!: EntityStatus;
    @Column() public version!: number;
    @Column() public createdAt!: Date;
    @Column() public updatedAt?: Date;
}
