import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { ActivateCommitteeMemberDTO } from "./activateCommitteeMemberDTO";

export class ActivateCommitteeMemberCommand {
    private constructor(
        public id: UniqueEntityID,
        public active: boolean,
    ) {}

    public static create(dto: ActivateCommitteeMemberDTO) {
        let id = new UniqueEntityID(dto.id);
        let active = true;

        return new ActivateCommitteeMemberCommand(id, active);
    }
}