import React from "react";
import "./VoucherSort.css";

interface VoucherSortProps {
    column: string;
    label: string;
    sortColumn: string;
    sortDirection: "asc" | "desc";
    onSort: (column: string) => void;
}

const VoucherSort: React.FC<VoucherSortProps> = ({
    column,
    label,
    sortColumn,
    sortDirection,
    onSort,
}) => {
    const isActive = sortColumn === column;
    const ariaSort = isActive ? (sortDirection === "asc" ? "ascending" : "descending") : "none";

    return (
        <th className={`vl-th ${isActive ? "is-sorted" : ""}`} aria-sort={ariaSort}>
            <button type="button" className="vl-th__btn" onClick={() => onSort(column)}>
                <span>{label}</span>
                <span className="vl-th__arrow" aria-hidden>
                    {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                </span>
            </button>
        </th>
    );
};

export default VoucherSort;
