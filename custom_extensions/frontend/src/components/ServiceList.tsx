import React, { createContext, useContext } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Create a context to pass drag props
const DragContext = createContext<{
  dragAttributes?: any;
  dragListeners?: any;
  isDragging?: boolean;
}>({});

// Hook to use drag context
export const useDragContext = () => {
  return useContext(DragContext);
};

// Export the context for external use
export { DragContext };

interface ServiceListProps {
  serviceOrder: string[];
  onServiceReorder: (newOrder: string[]) => void;
  renderService: (serviceId: string, index: number) => React.ReactNode;
  deletedElements: { [key: string]: boolean };
  shared: Boolean;
}

interface SortableServiceProps {
  serviceId: string;
  children: React.ReactNode;
  isDeleted: boolean;
}

function SortableService({ serviceId, children, isDeleted }: SortableServiceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: serviceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (isDeleted) return null;

  return (
    <DragContext.Provider value={{ dragAttributes: attributes, dragListeners: listeners, isDragging }}>
      <div
        ref={setNodeRef}
        style={style}
        className="transition-all duration-200"
      >
        {children}
      </div>
    </DragContext.Provider>
  );
}

export function ServiceList({ 
  serviceOrder, 
  onServiceReorder, 
  renderService, 
  deletedElements ,
  shared = false
}: ServiceListProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = serviceOrder.indexOf(active.id as string);
      const newIndex = serviceOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(serviceOrder, oldIndex, newIndex);
        onServiceReorder(newOrder);
      }
    }
    
    setActiveId(null);
  }

  if (shared) {
    return (
      <div className="flex flex-col gap-[30px] xl:gap-[50px]">
        {serviceOrder.map((serviceId, index) => {
          return renderService(serviceId, index);
        })}
      </div>
    );
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={serviceOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-[30px] xl:gap-[50px]">
          {serviceOrder.map((serviceId, index) => {
            // Calculate the visible index (excluding deleted services)
            const visibleIndex = serviceOrder.slice(0, index + 1).filter(id => !deletedElements[id]).length - 1;
            
            return (
              <SortableService
                key={serviceId}
                serviceId={serviceId}
                isDeleted={deletedElements[serviceId] || false}
              >
                {renderService(serviceId, visibleIndex)}
              </SortableService>
            );
          })}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <div className="opacity-95 rotate-1 scale-105 shadow-2xl">
            {(() => {
              const activeIndex = serviceOrder.indexOf(activeId);
              const visibleIndex = serviceOrder.slice(0, activeIndex + 1).filter(id => !deletedElements[id]).length - 1;
              return renderService(activeId, visibleIndex);
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
