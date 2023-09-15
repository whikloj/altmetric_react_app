import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ResultList from './Results.js';

/**
 * Loop through a bunch of DOIs and query Altmetric for their information.
 */
const queryAltmetric = (dois, addRecord, checkRecord, halt_on_error=false) => {

  const chunkSize = 100;
  let doiChunks = [];
  if (dois.length > chunkSize) {
    for (let i = 0; i < dois.length; i += chunkSize) {
        const chunk = dois.slice(i, i + chunkSize);
        doiChunks.push(chunk);
    }
  } else {
    doiChunks = [[...dois]];
  }

  doiChunks.forEach((items, i) => {
    const results = Promise.all(items.map(function(doi) {
      if (checkRecord(doi)) {
        const check_error = `DOI (${doi}) already exists in the list.`;
        window.alert(check_error)
        return new Promise(resolve => resolve({}));
      }
      try {
        return doQuery(doi);
      } catch (err) {
        let mesg = '';
        if (err.response) {
          console.log("In error response");
          console.log(err.response);
          //updateLimits(err.response.headers);
          if (err.response.status === 404) {
            mesg = `DOI ${doi} was not found in Altmetric`;
          } else {
            if (err.response.status === 429) {
              mesg = "You have hit the limit of requests available for now, check the request remaining on this page.";
            } else if (err.response.status === 403) {
              mesg = "You are not authorized to perform this action";
            } else {
              mesg = `An unknown error has occurred, received ${err.response.status}: ${err.message}`;
            }
            window.alert(mesg);

          }
        }
        return new Promise(resolve => resolve({}));
      }
    }));

    console.log("New q.all results");
    results.then(datas => {
      // Returns an array of response objects, filter out those without
      // data keys and then map to an array of objects with just the data
      const clean = datas.filter(d => d.data).map(d => d.data);
      addRecord(clean);
    });
  });
}

/**
 * Perform a query of altmetric
 */
async function doQuery(doi) {
  const uri = `https://api.altmetric.com/v1/doi/${doi}`;
  console.log(`Perform query to ${uri}`);

  /*
  // To avoid hitting Altmetric again and again
  const waitFor = (delay, d) => new Promise(resolve => setTimeout(() => resolve({'data':{ 'title': 'stuff', 'doi': d, 'score': 1}}), delay));
  return await waitFor(1500, doi);
  */

  return await axios.get(uri, {
    params: {
      "doi": doi
    }
  });
}

/**
 * Display a single DOI text box
 */
const SingleForm = ({ add, check, reset }) => {
  const [doi, setDoi] = useState('');

  // Only if Altmetric exposes the X- headers to CORS requests.
  /*const [requestLimit, setRequestLimit] = useState({});
  const updateLimits = headers => {
    setRequestLimit({
      'daily_remaining': headers['x-dailyratelimit-remaining'],
      'daily_total': headers['x-dailyratelimit-limit'],
      'hourly_remaining': headers['x-hourlyratelimit-remaining'],
      'hourly_total': headers['x-hourlyratelimit-limit']
    });
  };*/

  const handleEvent = evt => {
    evt.preventDefault();
    console.log(`Running SingleForm handleEvent with ${doi}`);
    queryAltmetric([doi], add, check, true);
    setDoi('')
  }

  return (
    <form onSubmit={handleEvent}>
      {/*<LimitForm requestLimit={requestLimit} />*/}
      <div className="doi-wrapper">
        <div className="label">DOI</div>
        <div><input size="30" type="text" value={doi} onChange={(event) => setDoi(event.target.value.trim())} required/></div>
      </div>
      <button type="submit">Add</button> <button onClick={() => {reset(); setDoi('')}}>Reset</button>
    </form>
  );
};

/**
 * Display a file upload form
 */
const MultiForm = ({ add, reset, check }) => {
  const [textFile, setTextFile] = useState();
  const [fileContents, setFileContents] = useState([]);

  const changeFile = evt => {
    evt.preventDefault()
    console.log("Changing file");
    setTextFile(evt.target.files[0]);
  }

  useEffect(() => {
    if (fileContents.length > 0) {
      const worker = [...fileContents];
      setFileContents([]);
      queryAltmetric(worker, add, check, true);
    }
  }, [fileContents, add, check]);

  const uploadFile = evt => {
    evt.preventDefault();

    if (typeof(textFile) != "undefined") {
      console.log(`textFile is ${textFile}`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        console.log(`text is ${text}`);
        const temp = text.split('\n');
        const splitDois = temp.filter((w) => w.length > 0).map(w => w.trim());
        setFileContents(splitDois);
        //setTextFile('');
      };
      reader.readAsText(textFile);
      if (reader.error) {
        window.alert("Problem reading file!");
      }
    }
  }

  return (
    <form>
      <p>Upload a plain text file of DOIs, one per line. This will automatically start processing all the DOIs.</p>
      <input type="file" accept=".txt" onChange={(e) => changeFile(e)} />
      <p><button onClick={uploadFile}>Upload</button> <button onClick={() => {reset()}}>Reset</button></p>
    </form>
  )
}

/**
 * React component to control the single and multiform Display
 */
const CitationForm = ({ add, reset, check }) => {
  // State 0 = SingleForm, 1 = MultiForm
  const [formState, setFormState] = useState(0);

  const toggleForm = () => {
    setFormState(formState === 0 ? 1 : 0);
  }

  if (formState === 1) {
    return (
      <div>
      <p>Single DOI <label className="slider-box"><span className="slider slide-right" onClick={() => toggleForm()} /></label> Multiple DOIs</p>
      <MultiForm add={add} reset={reset} check={check} />
      </div>
    );
  } else {
    return (
      <div>
      <p>Single DOI <label className="slider-box"><span className="slider slide-left" onClick={() => toggleForm()} /></label> Multiple DOIs</p>
      <SingleForm add={add} reset={reset} check={check} />
      </div>
    );
  }
}

const TotalBar = ({ records }) => {
  const [totalAttention, setTotalAttention] = useState(0);
  useEffect(() => {
    const new_attention = records.reduce((acc, current) => acc + current.score, 0);
    setTotalAttention(new_attention);
  }, [records])

  return (
    <div className="total_bar">
      <div className="total_item"><label htmlFor="total_count">Total records</label> <span id="total_count">{records.length}</span></div>
      <div className="total_item"><label htmlFor="total_attention">Cumulative attention score</label> <span id="total_attention">{totalAttention}</span></div>
    </div>
  )
}

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
  const [records, setRecords] = useState([]);
  const [recordIds, setRecordIds] = useState([]);

  const addNewRecord = record => {
    console.log(`Calling addNewRecord for ${record.length} records`);
    console.log(record);
    //console.log("current records");
    //console.log(records);
    if (record.length > 0) {
      const updateRec = records.concat(record).filter(i => typeof(i) !== "undefined" && typeof(i.doi) !== "undefined");
      console.log('updateRec');
      console.log(updateRec);
      setRecords(updateRec);
      //const new_ids = record.map(item => item.doi);
      //const updateIds = recordIds.concat(new_ids).filter(i => typeof(i) !== "undefined" && i.length > 0);
      //setRecordIds(updateIds);
    }
  }

  const showIds = () => {
    console.log("Record Ids");
    console.log(recordIds);
  }

  useEffect(() => {
    console.log("Updated records");
    console.log(records);
    const new_ids = records.map(item => item.doi);
    setRecordIds(new_ids);

  }, [records]);

  const resetRecords = () => {
    setRecords([]);
    setRecordIds([]);
  }

  const checkDup = doi => {
    console.log(`checkDup for ${doi}`);
    showIds();
    return recordIds.includes(doi.toLowerCase());
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Search Altmetric by DOI</h2>
        <CitationForm add={addNewRecord} reset={resetRecords} check={checkDup} />
      </header>
      <article className="App-totals">
        <TotalBar records={records} />
      </article>
      <article className="App-body">
        <ResultList results={records} />
      </article>
    </div>
  );
}

export default App;
