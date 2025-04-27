import { logger } from '../../utils/logger';
import { messageBus } from '../bus/message-bus';
import { MessageHandler } from '../handlers/handler.types';
import { MessageDispatcher } from '../handlers/message-dispatcher';
import { AppMessage, MessageContext, MessageResponse } from '../types';

const log = logger.getLogger('BaseMessagingService');

export abstract class BaseMessagingService<TContext extends MessageContext> {
  protected readonly context: TContext;
  protected readonly dispatcher: MessageDispatcher;
  protected readonly messageBus = messageBus;

  constructor(context: TContext) {
    this.context = context;
    this.dispatcher = new MessageDispatcher(context);
    log.info(`Service initialized for context: ${this.context}`);
  }

  /** Helper method for subclasses to register handlers */
  public registerHandler<T extends AppMessage>(
    type: T['type'],
    handler: MessageHandler<T>
  ): void {
    // Bind the handler to 'this' context of the specific service instance
    log.debug(`[${this.context}] Registering handler for ${type}`);
    this.dispatcher.register(type, handler.bind(this));
  }

  /**
   * Sends a message using the central message bus.
   * Ensures the 'source' property of the message is correctly set to this service's context.
   */
  protected async send<TResponseData = unknown>(
    message: Omit<AppMessage, 'source'>
  ): Promise<MessageResponse<TResponseData>> {
    const messageWithSource: AppMessage = {
      ...message,
      source: this.context,
    } as AppMessage;

    return this.messageBus.send<TResponseData>(messageWithSource);
  }
}