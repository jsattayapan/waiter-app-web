export const setUser = ({
  id,
  name,
  short_name,
  position,
  number
 }) => ({
  type: 'SET_USER',
  id,
  name,
  shortName: short_name,
  position,
  number,
});

export const clearUser = () => ({
  type: 'CLEAR_USER'
})

export const test = () => ({
  type: 'UPDATE_USER',
  name: 'Update from SOcket'
})
