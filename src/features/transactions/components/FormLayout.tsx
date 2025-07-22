import React from "react";
import { FieldRenderer } from "./FieldRenderer";
import { Layout, LayoutRow, LayoutCell, FieldConfig, SimpleExpenseFormPropsFromHook } from "./types";

interface FormLayoutProps {
  layout: Layout;
  fieldsConfig: FieldConfig[];
  formProps: SimpleExpenseFormPropsFromHook;
  columns?: number;
}

export function FormLayout({ layout, fieldsConfig, formProps, columns = 2 }: FormLayoutProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {layout.map((row: LayoutRow, rowIdx: number) =>
        row.map((cell: LayoutCell, cellIdx: number) => {
          const fieldMeta = fieldsConfig.find((f: FieldConfig) => f.name === cell.name);
          if (!fieldMeta) return null;
          const colSpan = cell.colSpan ? `md:col-span-${cell.colSpan}` : "";
          const colStart = cell.colStart ? `md:col-start-${cell.colStart}` : "";
          return (
            <div key={cell.name} className={`${colSpan} ${colStart}`}>
              <FieldRenderer field={fieldMeta} formProps={formProps} />
            </div>
          );
        })
      )}
    </div>
  );
} 