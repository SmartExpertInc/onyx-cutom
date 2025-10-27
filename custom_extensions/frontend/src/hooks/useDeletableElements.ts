import { useState, useCallback } from 'react';

interface DeletableElement {
  id: string;
  data?: any;
}

export const useDeletableElements = <T extends DeletableElement>(initialElements: T[] = []) => {
  const [elements, setElements] = useState<T[]>(initialElements);

  const addElement = useCallback((element: T) => {
    setElements(prev => [...prev, element]);
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(element => element.id !== id));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<T>) => {
    setElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    );
  }, []);

  const clearElements = useCallback(() => {
    setElements([]);
  }, []);

  const getElement = useCallback((id: string) => {
    return elements.find(element => element.id === id);
  }, [elements]);

  return {
    elements,
    addElement,
    removeElement,
    updateElement,
    clearElements,
    getElement,
    setElements
  };
};

export default useDeletableElements;
