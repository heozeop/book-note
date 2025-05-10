import { ICommand } from './command.interface';

/**
 * Interface for command handler pattern
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  /**
   * Execute the command
   * @param command Command to execute
   */
  execute(command: TCommand): Promise<TResult>;
} 