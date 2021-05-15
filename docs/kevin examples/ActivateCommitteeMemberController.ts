import { injectable } from "tsyringe";
import { BaseController } from "../../../../core/infra/BaseController";
import { ActivateCommitteeMemberCommand } from "./activateCommitteeMemberCommand";
import { ActivateCommitteeMemberDTO } from "./activateCommitteeMemberDTO";
import { ActivateCommitteeMemberUseCase } from "./activateCommitteeMemberUseCase";

@injectable()
export class ActivateCommitteeMemberController extends BaseController {
    constructor(private useCase: ActivateCommitteeMemberUseCase) {
        super();
    }

    async executeImpl() {
        const dto: ActivateCommitteeMemberDTO = this.req.body as ActivateCommitteeMemberDTO;
        const command = ActivateCommitteeMemberCommand.create(dto);
        await this.useCase.execute(command);
        const apiBase = process.env.API_BASE;

        this.ok(this.res, { links: {
            "form-committee": {href: `${apiBase}/committees`},
            "add-committee-member": {href: `${apiBase}/committee-members`},
            "activate-committee-member": {href: `${apiBase}/committee-members/activations`},
        }});
    }
}