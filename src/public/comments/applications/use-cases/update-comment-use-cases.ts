import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../comments.repository';
import { InputCommentDTO } from '../comments.dto';
import { Result, ResultCode } from '../../../../helpers/contract';

export class UpdateCommentCommand {
  constructor(
    public id: string,
    public inputData: InputCommentDTO,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCases
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<Result<boolean>> {
    const findComment = await this.commentsRepository.findCommentById(
      command.id,
    );
    if (!findComment)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'Comment not found',
      );
    if (findComment.userId !== command.userId)
      return new Result<boolean>(ResultCode.Forbidden, false, 'Access denied');
    await this.commentsRepository.updateComment(command.id, command.inputData);
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
