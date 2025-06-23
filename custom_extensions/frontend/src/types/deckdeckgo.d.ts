declare global {
  namespace JSX {
    interface IntrinsicElements {
      'deckgo-deck': {
        embedded?: boolean;
        keyboard?: boolean;
        navigation?: boolean;
        children?: React.ReactNode;
      };
      'deckgo-slide-content': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
      };
      'deckgo-slide-split': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
      };
      'deckgo-slide-title': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
      };
      h1: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      div: {
        slot?: string;
        className?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
    }
  }
}

export {}; 