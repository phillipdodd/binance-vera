import { PersonId } from "../../../modules/Protocols/domain/PersonId";
import { UniqueEntityID } from "../UniqueEntityID";
import { IDomainEvent } from "./IDomainEvent";

export class DomainEvent<T> implements IDomainEvent {
    public dateTimeOccurred: Date;
    public author: PersonId;
    public data: Omit<T, "id">
    
    public getAggregateId() {
        return this.id
    }

    constructor(private id: UniqueEntityID, data?: T extends {id?: string}) {
        this.dateTimeOccurred = new Date();
        const temp = {...data}
        delete temp.id;
        this.data = temp
    }

    public toJSON(): any {
        return {
            dateTimeOccurred: this.dateTimeOccurred,
            author: this.author?.id?.toString(),
            data: this.data
        }
    }
}