import io from 'socket.io-client';
import  { serverIpAddress } from './../constanst';
import { getTables, getCurrentShift } from './tables';
import { store } from './../App';
import { loadTables, setSectionTables, setCurrentShift } from './../Redux/actions/tables';

import { getTablesBySection } from './../Redux/selectors/tables';

export const initialSocket = (userId) => {
  const socket = io.connect(serverIpAddress);
  socket.emit('setUserId', userId);
  socket.on('tableUpdate', () => {
    console.log('Talbe Updating');
    getTables((data) => {
      store.dispatch(loadTables(data));
      store.dispatch(setSectionTables(
        getTablesBySection(data, store.getState().tables.sectionTables[0].section)
      ));
    });
  });

  socket.on('shiftUpdate', () => {
    getCurrentShift((status) => {
      store.dispatch(setCurrentShift(status));
    })
  })
}
