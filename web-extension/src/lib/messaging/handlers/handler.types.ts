
import { AppMessage, MessageResponse } from '../types';

// Generic handler function type, constrained by the message type it handles
export type MessageHandler<T extends AppMessage = AppMessage> = (
  message: T
) => Promise<MessageResponse<any>> | MessageResponse<any>;
