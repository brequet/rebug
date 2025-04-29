import { ScreenshotMessage } from './domains/screenshot.types';
import { UIMessage } from './domains/ui.types';
import { VideoMessage } from './domains/video.types';

// Export core types/enums for easier access
export * from '../config/context';
export * from './base';

// Export domain-specific types and actions
export * from './domains/screenshot.types';
export * from './domains/ui.types';
export * from './domains/video.types';

export type AppMessage =
    | ScreenshotMessage
    | VideoMessage
    | UIMessage;

export type AppMessageType = AppMessage['type'];
