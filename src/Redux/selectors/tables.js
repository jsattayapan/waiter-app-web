export const getTablesBySection = (tables, section) => {
  return tables.filter(sec => sec.section === section)[0].tables;
};
