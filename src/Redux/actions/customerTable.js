export const setCurrentOrders = (orders) => ({
  type: 'LOAD_CURRENT_ORDERS',
  orders: orders
});

export const setTableLogs = (logs) => ({
  type: 'LOAD_TABLES_LOGS',
  logs: logs
});

export const setSelectedTable = (tableInfo) => ({
  type: 'SET_SELECTED_TABLE',
  payload: tableInfo
});
