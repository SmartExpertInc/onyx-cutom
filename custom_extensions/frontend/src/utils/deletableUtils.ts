import React from 'react';

export interface DeletableConfig {
  onDelete?: () => void;
  className?: string;
  deleteButtonClassName?: string;
  confirmDelete?: boolean;
  deleteConfirmText?: string;
  disabled?: boolean;
  showOnHover?: boolean;
  deleteButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  deleteButtonSize?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const makeDeletable = <T extends React.ComponentType<any>>(
  Component: T,
  defaultConfig: DeletableConfig = {}
) => {
  return React.forwardRef<any, React.ComponentProps<T> & DeletableConfig>((props, ref) => {
    const { onDelete, ...componentProps } = props;
    const config = { ...defaultConfig, ...props };

    if (!onDelete) {
      return React.createElement(Component, { ...componentProps, ref });
    }

    // Import DeletableWrapper dynamically to avoid circular dependencies
    const DeletableWrapper = React.lazy(() => import('../components/DeletableWrapper'));
    
    return React.createElement(
      React.Suspense,
      { fallback: React.createElement(Component, { ...componentProps, ref }) },
      React.createElement(
        DeletableWrapper,
        { ...config, children: React.createElement(Component, { ...componentProps, ref }) }
      )
    );
  });
};

export const createDeletableElement = (
  element: React.ReactElement,
  config: DeletableConfig
): React.ReactElement => {
  const DeletableWrapper = React.lazy(() => import('../components/DeletableWrapper'));
  
  return React.createElement(
    React.Suspense,
    { fallback: element },
    React.createElement(
      DeletableWrapper,
      { ...config, children: element }
    )
  );
};

export default {
  makeDeletable,
  createDeletableElement
};
