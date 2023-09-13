import { useState } from 'react';
import axios from 'axios';
import './App.css';

const Result = (index, props) => {
  return (
    <tr key={index} className="citation_result" >
      <td className="title_data">{props.title}</td>
      <td>{props.doi}</td>
      <td>{props.type}</td>
      <td>{props.cited_by_accounts_count}</td>
      <td>{props.cited_by_policies_count}</td>
      <td>{props.cited_by_patents_count}</td>
      <td>{props.score}</td>
      <td>{props.altmetric_id}</td>
      <td>{props.details_url}</td>
    </tr>
  );
};

const ResultList = props => {
  return (
    <table className="results">
      <thead>
        <tr>
          <th>Title</th>
          <th>DOI</th>
          <th>Type</th>
          <th>Attention score</th>
          <th>Cited by (count)</th>
          <th>Cited in policies (count)</th>
          <th>Cited in patents (count)</th>
          <th>Details URL</th>
        </tr>
      </thead>
      <tbody>
      { props.results.map((result, index) => (
        <tr key={index} className="citation_result" >
          <td className="title_data">{result.title}</td>
          <td>{result.doi}</td>
          <td>{result.type}</td>
          <td>{result.score}</td>
          <td>{result.cited_by_accounts_count}</td>
          <td>{result.cited_by_policies_count}</td>
          <td>{result.cited_by_patents_count}</td>
          <td><a className="App-link" href={result.details_url} target="_new">details</a></td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

const CitationForm = props => {
  const [doi, setDoi] = useState('');
  const [timeframe, setTimeframe] = useState('at');

  const handleEvent = evt => {
    evt.preventDefault();
    let uri = `https://api.altmetric.com/v1/doi/${doi}`;
    console.log(`Perform query to ${uri}`);
    console.log(`props is ${typeof(props)}`);
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
      <div>
        <div className="label">DOI</div>
        <div><input length="40ch" type="text" value={doi} onChange={(event) => setDoi(event.target.value)} required/></div>
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
  return (
    <div className="App">
      <header className="App-header">
        <CitationForm add={addNewRecord} reset={resetRecords} />
      </header>
      <article className="App-body">
        <ResultList results={records} />
      </article>
    </div>
  );
}

export default App;
