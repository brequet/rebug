import { ScreenshotMessage } from './screenshot.types';
import { UIMessage } from './ui.types';
import { VideoMessage } from './video.types';

// Export core types/enums for easier access
export * from '../config/context';
export * from './base';

// Export domain-specific types and actions
export * from './screenshot.types';
export * from './ui.types';
export * from './video.types';

export type AppMessage =
    | ScreenshotMessage
    | VideoMessage
    | UIMessage;

export type AppMessageType = AppMessage['type'];
