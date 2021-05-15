import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { DomainEvent } from "../../../../core/domain/events/DomainEvent";
import { SendToSecondaryReviewDTO } from "../../useCases/protocolWorkflow/sendToSecondaryReview/SendToSecondaryReviewDTO";

export class ProtocolSentToSecondaryReviewFromSubCommitteeReview extends DomainEvent {
    constructor(id: UniqueEntityID, data: SendToSecondaryReviewDTO) {
        super(id, data)
    }
}