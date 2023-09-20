import React, { createContext, useReducer } from "react"

const recordReducer = (state, action) => {
  const { new_records, type } = action
  const new_state = {...state}
  console.log({'state': state, 'new_records': new_records, 'type': type});
  if (type === 'add') {
    const update_records = [...new_records].filter(i => typeof(i) !== "undefined" && typeof(i.doi) !== "undefined")
    new_state.recordList = state.recordList.concat(update_records);
    new_state.recordIds = state.recordIds.concat(update_records.map(r => r.doi));
    new_state.totalAttention = new_state.recordList.map(r => r.score).reduce((acc, curr) => acc + curr, 0);
  } else if (type === 'reset') {
    new_state.recordList = [];
    new_state.recordIds = [];
    new_state.totalAttention = 0;
  } else if (type === 'toggle') {
    new_state.formState = state.formState === 0 ? 1 : 0;
  }
  console.log({'new_state': new_state});
  return new_state;
}

export const RecordContext = createContext();

export const RecordProvider = (props) => {
  const [ recordState, setRecordState ] = useReducer(recordReducer, {recordList: [], recordIds: [], totalAttention: 0, formState: 0});
  return <RecordContext.Provider value={{recordState, setRecordState }}> {props.children} </RecordContext.Provider>
}
