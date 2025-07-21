import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Standard HTML elements
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      blockquote: React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      cite: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      details: React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
      summary: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      // DeckDeckGo elements
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
      // Розширені DeckDeckGo компоненти
      'deckgo-slide-chart': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        type?: 'line' | 'pie' | 'bar' | 'doughnut' | 'radar' | 'polarArea';
        src?: string;
        width?: number;
        height?: number;
        marginTop?: number;
        marginBottom?: number;
        marginLeft?: number;
        marginRight?: number;
      };
      'deckgo-slide-gif': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        src?: string;
        alt?: string;
        fullscreen?: boolean;
      };
      'deckgo-slide-youtube': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        src?: string;
        width?: number;
        height?: number;
        frameTitle?: string;
      };
      'deckgo-slide-code': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        language?: string;
        highlightLines?: string;
        lineNumbers?: boolean;
        terminal?: 'carbon' | 'ubuntu' | 'windows10';
      };
      'deckgo-slide-qrcode': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        content?: string;
        logo?: string;
        imgSrc?: string;
        imgAlt?: string;
      };
      'deckgo-slide-countdown': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        hours?: number;
        minutes?: number;
        seconds?: number;
      };
      'deckgo-slide-author': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        imgSrc?: string;
        imgAlt?: string;
      };
      'deckgo-slide-poll': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        pollKey?: string;
        socketUrl?: string;
        connectPoll?: boolean;
      };
      'deckgo-slide-aspect-ratio': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        ratio?: string;
        grid?: boolean;
        editable?: boolean;
      };
      'deckgo-slide-playground': {
        key?: string | number;
        children?: React.ReactNode;
        slot?: string;
        src?: string;
        theme?: 'default' | 'dark' | 'light';
      };
      h1: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      h2: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      h3: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      p: {
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
      ul: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      ol: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      li: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      code: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      pre: {
        slot?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
      img: {
        slot?: string;
        src?: string;
        alt?: string;
        [key: string]: any;
      };
    }
  }
}

export {}; 