import io from 'socket.io-client';
import  { serverIpAddress } from './../constanst';
import { getTables } from './tables';
import { store } from './../App';
import { loadTables, setSectionTables } from './../Redux/actions/tables';

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
}
