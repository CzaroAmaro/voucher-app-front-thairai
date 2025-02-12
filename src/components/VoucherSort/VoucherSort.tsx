import React from "react";
import "./VoucherSort.css";

interface VoucherSortProps {
    column: string;
    label: string;
    sortColumn: string;
    sortDirection: "asc" | "desc";
    onSort: (column: string) => void;
}

const VoucherSort: React.FC<VoucherSortProps> =
    ({
         column,
         label,
         sortColumn,
         sortDirection,
         onSort,
     }) => {
    const isActive = sortColumn === column;
    const arrow = isActive
        ? sortDirection === "asc"
            ? "▲"
            : "▼"
        : "▲";

    return (
        <th onClick={() => onSort(column)} className="sortable-header">
            {label} {arrow}
        </th>
    );
};

export default VoucherSort;
