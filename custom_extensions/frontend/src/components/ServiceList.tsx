import React from 'react';
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

interface ServiceListProps {
  serviceOrder: string[];
  onServiceReorder: (newOrder: string[]) => void;
  renderService: (serviceId: string, index: number, dragProps?: any) => React.ReactNode;
  deletedElements: { [key: string]: boolean };
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
    <div
      ref={setNodeRef}
      style={style}
      className="transition-all duration-200"
    >
      {React.cloneElement(children as React.ReactElement, {
        dragAttributes: attributes,
        dragListeners: listeners,
        isDragging
      })}
    </div>
  );
}

export function ServiceList({ 
  serviceOrder, 
  onServiceReorder, 
  renderService, 
  deletedElements 
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={serviceOrder} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-[30px] xl:gap-[50px]">
          {serviceOrder.map((serviceId, index) => (
            <SortableService
              key={serviceId}
              serviceId={serviceId}
              isDeleted={deletedElements[serviceId] || false}
            >
              {renderService(serviceId, index)}
            </SortableService>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <div className="opacity-95 rotate-1 scale-105 shadow-2xl">
            {renderService(activeId, serviceOrder.indexOf(activeId))}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
