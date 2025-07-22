import React from "react";
import { FieldRenderer } from "./FieldRenderer";
import { Layout, LayoutRow, LayoutCell, FieldConfig, FormHookProps } from "./types";

interface FormLayoutProps {
  layout: Layout;
  fieldsConfig: FieldConfig[];
  formProps: FormHookProps<Record<string, unknown>>;
  columns?: number;
}

export function FormLayout({ layout, fieldsConfig, formProps, columns = 2 }: FormLayoutProps) {
  const gridColsClass =
    columns === 1 ? "md:grid-cols-1" :
    columns === 2 ? "md:grid-cols-2" :
    columns === 3 ? "md:grid-cols-3" :
    "md:grid-cols-1"; // fallback

  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
      {layout.map((row: LayoutRow) =>
        row.map((cell: LayoutCell) => {
          const fieldMeta = fieldsConfig.find((f: FieldConfig) => f.name === cell.name);
          if (!fieldMeta) return null;
          const colSpanClass =
            cell.colSpan === 1 ? "md:col-span-1" :
            cell.colSpan === 2 ? "md:col-span-2" :
            cell.colSpan === 3 ? "md:col-span-3" :
            "";

          const colStartClass =
            cell.colStart === 1 ? "md:col-start-1" :
            cell.colStart === 2 ? "md:col-start-2" :
            cell.colStart === 3 ? "md:col-start-3" :
            "";
          return (
            <div key={cell.name} className={`${colSpanClass} ${colStartClass}`}>
              <FieldRenderer field={fieldMeta} formProps={formProps} />
            </div>
          );
        })
      )}
    </div>
  );
} 