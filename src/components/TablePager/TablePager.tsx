import React from "react";

interface TablePagerProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    pageSizes: readonly number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

/**
 * Paginacja tabeli — ten sam wygląd i zachowanie co na liście voucherów.
 * Korzysta z klas vl-* (musi być renderowana w obrębie .vl-page).
 */
const TablePager: React.FC<TablePagerProps> = ({
    currentPage,
    totalPages,
    pageSize,
    pageSizes,
    onPageChange,
    onPageSizeChange,
}) => (
    <div className="vl-pagination">
        <div className="vl-field vl-field--inline">
            <label htmlFor="vl-pagesize">Na stronę</label>
            <select
                id="vl-pagesize"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
                {pageSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
        <div className="vl-pager">
            <button
                type="button"
                className="vl-btn"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
            >
                Poprzednia
            </button>
            <span className="vl-pager__info">Strona {currentPage} z {totalPages}</span>
            <button
                type="button"
                className="vl-btn"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Następna
            </button>
        </div>
    </div>
);

export default TablePager;
