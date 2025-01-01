import type { Attributes, ReactNode } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': Attributes & {
        'connect-wallet'?: () => void; // Example prop
        children?: ReactNode; // Important for content inside the button
        // Add other specific props here
        [key: string]: any; // Use sparingly
      };
    }
  }
}