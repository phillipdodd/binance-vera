import { DomainEvents } from "../../../../core/domain/events/DomainEvents";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../../core/domain/UseCase";
import { CommitteeMemberRepo, ICommitteeMemberRepo } from "../../repos/CommitteeMemberRepo";
import { IPersonRepo, PersonRepo } from "../../repos/PersonRepo";
import { ActivateCommitteeMemberCommand } from "./activateCommitteeMemberCommand";

@injectable()
export class ActivateCommitteeMemberUseCase implements UseCase<ActivateCommitteeMemberCommand, void> {
    constructor(@inject(PersonRepo) private personRepo: IPersonRepo, @inject(CommitteeMemberRepo) private memberRepo: ICommitteeMemberRepo) {}

    async execute(command: ActivateCommitteeMemberCommand) {
        if (!this.personRepo.exists(command.id)) {
            throw new Error("This person does not exist");
        }
        
        const member = await this.memberRepo.getCommitteeMemberById(command.id);
        member.activate();

        await this.memberRepo.save(member);
        DomainEvents.dispatchAggregateEvents(member);
    }
}