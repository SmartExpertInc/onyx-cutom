import React from 'react';
import InlineEditor from './InlineEditor';

interface WithInlineEditingProps {
  slideId: string;
  isEditable?: boolean;
  inlineEditing?: any;
  onInlineEditSave?: (slideId: string, fieldPath: string[], value: string) => void;
}

export function withInlineEditing<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return React.forwardRef<any, P & WithInlineEditingProps>((props, ref) => {
    const {
      slideId,
      isEditable = false,
      inlineEditing,
      onInlineEditSave,
      ...componentProps
    } = props;

    // Helper function to render editable field
    const renderEditableField = (
      fieldPath: string[],
      value: string,
      renderDisplay: (value: string) => React.ReactNode,
      options: {
        multiline?: boolean;
        placeholder?: string;
        className?: string;
        style?: React.CSSProperties;
        maxLength?: number;
        rows?: number;
      } = {}
    ) => {
      if (!isEditable || !inlineEditing || !onInlineEditSave) {
        return renderDisplay(value);
      }

      const isCurrentlyEditing = inlineEditing.isEditing(slideId, fieldPath);
      const editingValue = inlineEditing.getEditingValue(slideId, fieldPath);

      if (isCurrentlyEditing) {
        return (
          <InlineEditor
            initialValue={editingValue || value}
            onSave={(newValue) => {
              onInlineEditSave(slideId, fieldPath, newValue);
              inlineEditing.stopEditing();
            }}
            onCancel={() => {
              inlineEditing.cancelChanges();
            }}
            multiline={options.multiline}
            placeholder={options.placeholder}
            className={options.className}
            style={options.style}
            maxLength={options.maxLength}
            rows={options.rows}
          />
        );
      }

      return (
        <div
          className="editable-field cursor-pointer hover:bg-yellow-50 rounded p-1 transition-colors duration-200"
          onClick={() => {
            inlineEditing.startEditing(slideId, fieldPath, value);
          }}
          title="Click to edit"
        >
          {renderDisplay(value)}
        </div>
      );
    };

    // Helper function to render editable text field
    const renderEditableText = (
      fieldPath: string[],
      value: string,
      options: {
        multiline?: boolean;
        placeholder?: string;
        className?: string;
        style?: React.CSSProperties;
        maxLength?: number;
        rows?: number;
      } = {}
    ) => {
      return renderEditableField(
        fieldPath,
        value,
        (displayValue) => (
          <span className={options.className} style={options.style}>
            {displayValue || options.placeholder}
          </span>
        ),
        options
      );
    };

    // Helper function to render editable array field
    const renderEditableArray = (
      fieldPath: string[],
      items: string[],
      options: {
        placeholder?: string;
        className?: string;
        style?: React.CSSProperties;
        maxLength?: number;
      } = {}
    ) => {
      if (!isEditable || !inlineEditing || !onInlineEditSave) {
        return (
          <div className={options.className} style={options.style}>
            {items.map((item, index) => (
              <div key={index} className="mb-2">
                {item}
              </div>
            ))}
          </div>
        );
      }

      const isCurrentlyEditing = inlineEditing.isEditing(slideId, fieldPath);
      const editingValue = inlineEditing.getEditingValue(slideId, fieldPath);

      if (isCurrentlyEditing) {
        return (
          <InlineEditor
            initialValue={editingValue || items.join('\n')}
            onSave={(newValue) => {
              const newItems = newValue.split('\n').filter(item => item.trim());
              onInlineEditSave(slideId, fieldPath, newItems);
              inlineEditing.stopEditing();
            }}
            onCancel={() => {
              inlineEditing.cancelChanges();
            }}
            multiline={true}
            placeholder={options.placeholder || 'Enter items, one per line'}
            className={options.className}
            style={options.style}
            maxLength={options.maxLength}
            rows={Math.max(4, items.length + 1)}
          />
        );
      }

      return (
        <div
          className={`editable-field cursor-pointer hover:bg-yellow-50 rounded p-2 transition-colors duration-200 ${options.className || ''}`}
          onClick={() => {
            inlineEditing.startEditing(slideId, fieldPath, items.join('\n'));
          }}
          title="Click to edit"
          style={options.style}
        >
          {items.map((item, index) => (
            <div key={index} className="mb-2">
              {item}
            </div>
          ))}
        </div>
      );
    };

    // Pass the helper functions to the wrapped component
    const enhancedProps = {
      ...componentProps,
      renderEditableField,
      renderEditableText,
      renderEditableArray,
      slideId,
      isEditable,
      inlineEditing,
      onInlineEditSave
    } as P & WithInlineEditingProps;

    return <WrappedComponent {...enhancedProps} ref={ref} />;
  });
} 