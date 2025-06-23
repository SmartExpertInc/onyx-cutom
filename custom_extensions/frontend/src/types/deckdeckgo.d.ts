declare namespace JSX {
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
    };
    'deckgo-slide-split': {
      key?: string | number;
      children?: React.ReactNode;
    };
    'deckgo-slide-title': {
      key?: string | number;
      children?: React.ReactNode;
    };
  }
} 