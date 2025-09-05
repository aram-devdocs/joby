import { Logger, TerminalTransport, ConsoleTransport } from '@packages/shared';
import { eventBus } from '../events';

// Initialize Logger with TerminalTransport for backend
export function initializeLogger(): void {
  // Add terminal transport to send logs to the terminal UI
  Logger.addTransport(
    new TerminalTransport({
      eventBus: {
        emit: (event) => {
          // Type assertion needed to bridge between shared package's Partial<StreamEvent>
          // and the full StreamEvent type expected by eventBus
          const typedEvent = event as unknown as Parameters<
            typeof eventBus.emit
          >[0];
          eventBus.emit(typedEvent);
        },
      },
    }),
  );

  // Add console transport for development
  if (process.env.NODE_ENV !== 'production') {
    Logger.addTransport(
      new ConsoleTransport({
        colors: true,
        timestamp: true,
      }),
    );
  }

  // Set default log level based on environment
  Logger.configure({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    source: 'llm',
  });
}

// Export configured Logger
export { Logger };
