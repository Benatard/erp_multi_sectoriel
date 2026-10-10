import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  rows = [],
  loading,
  rowKey = 'id',
  onEdit,
  onDelete,
  emptyTitle,
  emptyDesc,
}) {
  const hasActions = onEdit || onDelete;

  if (loading) {
    return (
      <div className="card-root">
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray2 dark:bg-[#2C303B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="card-root">
        <EmptyState title={emptyTitle || 'Aucune donnée'} desc={emptyDesc} />
      </div>
    );
  }

  return (
    <div className="card-root overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke dark:border-[#2C303B] bg-gray2 dark:bg-[#2C303B]/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {hasActions && <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-body dark:text-body-dark">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke dark:divide-[#2C303B]">
            {rows.map((row) => (
              <tr key={row[rowKey]} className="bg-white dark:bg-gray-dark hover:bg-gray2/60 dark:hover:bg-[#2C303B]/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-dark dark:text-body-dark ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          aria-label={`Modifier ${row[columns[0].key]}`}
                          className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          aria-label="Supprimer"
                          className="h-9 w-9 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}