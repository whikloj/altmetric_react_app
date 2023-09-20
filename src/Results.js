import { useContext } from 'react';
import { RecordContext } from './RecordContext';

export const ResultList = () => {
  const { recordState } = useContext(RecordContext);
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
      { recordState.recordList.map((result, index) => (
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
