import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { DomainEvent } from "../../../../core/domain/events/DomainEvent";


export class AlternateMemberAdded extends DomainEvent<{member: string}> {
    constructor(id: UniqueEntityID, data: {member: string}) {
        super(id, data)
    }
}