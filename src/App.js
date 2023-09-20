import './App.css';
import { ResultList } from './Results';
import { RecordProvider } from './RecordContext';
import { TotalBar } from './TotalBar';
import { CitationForm } from './Forms';

// Only if Altmetric exposes the X- headers to CORS requests.
/*
const LimitForm = ({ requestLimit }) => {
  const hourly_class = `request_limits${typeof(requestLimit['hourly_remaining']) !== "undefined" && requestLimit['hourly_remaining'] < 11 ? ' warning': ''}`;
  const daily_class = `request_limits${typeof(requestLimit['daily_remaining']) !== "undefined" && requestLimit['daily_remaining'] < 11 ? ' warning': ''}`;
  const hourly_string =
    typeof(requestLimit['hourly_remaining']) !== "undefined" ?
      <p>{requestLimit['hourly_remaining']} of {requestLimit['hourly_limit']}</p> :
      "";
  const daily_string =
    typeof(requestLimit['daily_remaining']) !== "undefined" ?
      <p>{requestLimit['daily_remaining']} of {requestLimit['daily_limit']}</p> :
      "";

  return (
    <div className="request-wrapper">
      <div id="hourlyLimit" className={hourly_class}>
        <p>Hourly Requests Remaining</p>
        {hourly_string}
      </div>
      <div id="dailyLimit" className={daily_class}>
        <p>Daily Requests Remaining</p>
        {daily_string}
      </div>
    </div>
  );
}
*/


function App() {

  return (
    <RecordProvider>
    <div className="App">
      <header className="App-header">
        <h2>Search Altmetric by DOI</h2>
        <CitationForm />
      </header>
      <article className="App-totals">
        <TotalBar />
      </article>
      <article className="App-body">
        <ResultList />
      </article>
    </div>
    </RecordProvider>
  );
}

export default App;
