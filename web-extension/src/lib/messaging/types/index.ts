import { AuthMessage } from './domains/auth.types';
import { BoardMessage } from './domains/board.types';
import { ReportingMessage } from './domains/reporting.types';
import { ScreenshotMessage } from './domains/screenshot.types';
import { UIMessage } from './domains/ui.types';
import { VideoMessage } from './domains/video.types';

export * from '../config/context';
export * from './base';

export * from './domains/auth.types';
export * from './domains/board.types';
export * from './domains/reporting.types';
export * from './domains/screenshot.types';
export * from './domains/ui.types';
export * from './domains/video.types';

export type AppMessage =
    | AuthMessage
    | BoardMessage
    | ReportingMessage
    | ScreenshotMessage
    | VideoMessage
    | UIMessage;

export type AppMessageType = AppMessage['type'];
