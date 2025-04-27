import { logger } from '../../utils/logger';
import { AppMessage, AppMessageType, MessageContext, createErrorResponse } from '../types';
import { MessageHandler } from './handler.types';

const log = logger.getLogger('MessageDispatcher');

export class MessageDispatcher {
  private readonly handlers = new Map<AppMessageType, MessageHandler<any>>();
  private readonly currentContext: MessageContext;

  constructor(context: MessageContext) {
    this.currentContext = context;
    this.registerListener();
    log.info(`Initialized for context: ${this.currentContext}`);
  }

  /** Registers a handler for a specific message type */
  register<T extends AppMessage>(
    type: T['type'],
    handler: MessageHandler<T>
  ): void {
    if (this.handlers.has(type)) {
      log.warn(`Overwriting handler for message type: ${type}`);
    }
    this.handlers.set(type, handler);
    log.debug(`Registered handler for ${type}`);
  }

  /** Sets up the main browser message listener */
  private registerListener(): void {
    browser.runtime.onMessage.addListener(
      (message: unknown, sender, sendResponse) => {
        // 1. Basic Validation & Context Check
        if (!this.isValidAppMessage(message) || message.target !== this.currentContext) {
          // Ignore messages not for this context or malformed
          return false; // Important: Indicates we are not handling this message asynchronously
        }

        log.debug(`Received ${message.type} from ${message.source} (tabId: ${sender.tab?.id})`);

        // 2. Find Handler
        const handler = this.handlers.get(message.type);
        if (!handler) {
          const errorMsg = `No handler registered for message type ${message.type} in ${this.currentContext}`;
          log.error(errorMsg);
          sendResponse(createErrorResponse(errorMsg));
          return false; // No async response needed
        }

        // 3. Execute Handler (Async)
        Promise.resolve()
          .then(() => handler(message))
          .then((response) => {
            log.debug(`Sending response for ${message.type}:`, response);
            sendResponse(response);
          })
          .catch((error) => {
            const errorMsg = `Handler for ${message.type} threw an error: ${error?.message || error}`;
            log.error(errorMsg, error);
            sendResponse(createErrorResponse(errorMsg));
          });

        // 4. Indicate Asynchronous Response
        // Crucial: Tells Chrome to keep the message channel open for the async response
        return true;
      }
    );
  }

  /** Type guard to validate incoming messages */
  private isValidAppMessage(message: any): message is AppMessage {
    return (
      typeof message === 'object' &&
      message !== null &&
      typeof message.type === 'string' &&
      typeof message.source === 'string' &&
      typeof message.target === 'string' &&
      Object.values(MessageContext).includes(message.target as MessageContext) &&
      Object.values(MessageContext).includes(message.source as MessageContext)
    );
  }
}