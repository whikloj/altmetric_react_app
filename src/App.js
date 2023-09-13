import { useState } from 'react';
import axios from 'axios';
import './App.css';
import ResultList from './Results.js';

const CitationForm = props => {
  const [doi, setDoi] = useState('');

  const handleEvent = evt => {
    evt.preventDefault();
    if (props.check(doi.trim())) {
        window.alert(`DOI ${doi} already exists in list`);
        return;
    }
    let uri = `https://api.altmetric.com/v1/doi/${doi}`;
    console.log(`Perform query to ${uri}`);
    axios.get(uri, {
      params: {
        "doi": doi
      }
    }).then(resp => {
        props.add(resp.data);
        setDoi('');
    });
  }

  return (
    <form onSubmit={handleEvent}>
      <h2>Add DOI</h2>
      <div className="doi-wrapper">
        <div className="label">DOI</div>
        <div><input length="100" type="text" value={doi} onChange={(event) => setDoi(event.target.value)} required/></div>
      </div>
      <button type="submit">Add</button> <button onClick={() => {props.reset(); setDoi('')}}>Reset</button>
    </form>
  );
};

function App() {
  const [records, setRecords] = useState([])
  const addNewRecord = record => {
    setRecords(records.concat(record));
  }
  const resetRecords = () => setRecords([])
  const checkDup = doi => records.find((element) => {
    for (var x=0; x < records.length; x += 1) {
      if (records[x].doi === doi) {
        return true;
      }
    }
    return false;
  });
  return (
    <div className="App">
      <header className="App-header">
        <CitationForm add={addNewRecord} reset={resetRecords} check={checkDup} />
      </header>
      <article className="App-body">
        <ResultList results={records} />
      </article>
    </div>
  );
}

export default App;
