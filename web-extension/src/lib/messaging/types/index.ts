import { ScreenshotMessage } from './domains/screenshot.types';
import { UIMessage } from './domains/ui.types';
import { VideoMessage } from './domains/video.types';

export * from '../config/context';
export * from './base';

export * from './domains/screenshot.types';
export * from './domains/ui.types';
export * from './domains/video.types';

export type AppMessage =
    | ScreenshotMessage
    | VideoMessage
    | UIMessage;

export type AppMessageType = AppMessage['type'];
