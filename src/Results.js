
function ResultList(props) {
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

export default ResultList;