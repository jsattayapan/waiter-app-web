export const loadTables = (tables) => ({
  type: 'LOAD_TABLES',
  tables: tables
});

export const setSectionTables = (tables) => {
  console.log('Action Table: ', tables);
  return {
    type: 'SET_SECTION_TABLES',
    tables: tables
  }
};
