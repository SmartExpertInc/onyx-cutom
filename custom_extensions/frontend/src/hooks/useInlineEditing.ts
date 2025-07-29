import { useState, useCallback } from 'react';

interface EditingState {
  slideId: string;
  fieldPath: string[];
  value: string | string[];
}

export const useInlineEditing = () => {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const startEditing = useCallback((slideId: string, fieldPath: string[], initialValue: string | string[]) => {
    setEditingState({
      slideId,
      fieldPath,
      value: initialValue
    });
  }, []);

  const stopEditing = useCallback(() => {
    setEditingState(null);
  }, []);

  const updateEditingValue = useCallback((newValue: string | string[]) => {
    if (editingState) {
      setEditingState({
        ...editingState,
        value: newValue
      });
      setHasUnsavedChanges(true);
    }
  }, [editingState]);

  const saveChanges = useCallback((onSave: (slideId: string, fieldPath: string[], value: string | string[]) => void) => {
    if (editingState) {
      onSave(editingState.slideId, editingState.fieldPath, editingState.value);
      setEditingState(null);
      setHasUnsavedChanges(false);
    }
  }, [editingState]);

  const cancelChanges = useCallback(() => {
    setEditingState(null);
    setHasUnsavedChanges(false);
  }, []);

  const isEditing = useCallback((slideId: string, fieldPath: string[]) => {
    return editingState?.slideId === slideId && 
           JSON.stringify(editingState.fieldPath) === JSON.stringify(fieldPath);
  }, [editingState]);

  const getEditingValue = useCallback((slideId: string, fieldPath: string[]) => {
    if (isEditing(slideId, fieldPath)) {
      return editingState?.value || '';
    }
    return null;
  }, [editingState, isEditing]);

  return {
    editingState,
    hasUnsavedChanges,
    startEditing,
    stopEditing,
    updateEditingValue,
    saveChanges,
    cancelChanges,
    isEditing,
    getEditingValue
  };
}; 