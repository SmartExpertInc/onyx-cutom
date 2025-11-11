import React, { useCallback } from "react";
import MyProductsTable from "../MyProductsTable";

export interface ModalProduct {
  id: number;
  title: string;
  type?: string;
  createdAt?: string;
  folderId?: number | null;
}

interface MyProductsModalContentProps {
  onSelectionChange?: (ids: number[], products: ModalProduct[]) => void;
  className?: string;
}

const MyProductsModalContent: React.FC<MyProductsModalContentProps> = ({
  onSelectionChange,
  className = "",
}) => {
  const handleSelectionChange = useCallback(
    (ids: number[], projects: any[]) => {
      if (!onSelectionChange) return;
      const mapped: ModalProduct[] = projects.map((project) => ({
        id: project.id,
        title: project.title,
        type: project.designMicroproductType,
        createdAt: project.createdAt,
        folderId: project.folderId ?? null,
      }));
      onSelectionChange(ids, mapped);
    },
    [onSelectionChange]
  );

  return (
    <div className={className}>
      <MyProductsTable selectionMode="select" onSelectionChange={handleSelectionChange} />
    </div>
  );
};

export default MyProductsModalContent;

