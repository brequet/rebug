// src/lib/messaging/handlers/handler.types.ts
import { AppMessage, MessageResponse } from '../types';

type HandlerWithoutSender<T extends AppMessage> = (
  message: T
) => Promise<MessageResponse<any>> | MessageResponse<any>;

type HandlerWithSender<T extends AppMessage> = (
  message: T,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse<any>> | MessageResponse<any>;

export type MessageHandler<T extends AppMessage = AppMessage> =
  | HandlerWithoutSender<T>
  | HandlerWithSender<T>;

