import { useContext, useState, useEffect } from 'react';
import { RecordContext } from './RecordContext';
import axios from 'axios';

/**
 * Display a single DOI text box
 */
const SingleForm = ({add, check, resetRecords}) => {
  const [doi, setDoi] = useState('');

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
      <button type="submit">Add</button> <button onClick={() => {resetRecords(); setDoi('')}}>Reset</button>
    </form>
  );
};

/**
 * Display a file upload form
 */
const MultiForm = ({add, check, resetRecords}) => {
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

    console.log({'textFile': textFile});
    if (typeof(textFile) === "object") {
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
    <div>
      <p>Upload a plain text file of DOIs, one per line. This will automatically start processing all the DOIs.</p>
      <p><input type="file" id="form-doi-file" accept=".txt" onChange={(e) => changeFile(e)} /></p>
      <button onClick={evt => uploadFile(evt)}>Upload</button> <button onClick={e => {resetRecords();
        document.getElementById('form-doi-file').value = ''}}>Reset</button>
    </div>
  )
}

/**
 * React component to control the single and multiform Display
 */
export const CitationForm = () => {
  const { recordState, setRecordState } = useContext(RecordContext);
  const toggleForm = () => {
    setRecordState({type: 'toggle'});
  }
  const resetRecords = () => {
    console.log('do a reset');
    setRecordState({type: 'reset'});
  }
  const checkRecord = doi => {
    console.log(`checkRecord for ${doi}`);
    return recordState.recordIds.includes(doi.toLowerCase());
  }
  const addRecord = records => {
    setRecordState({new_records: records, type: 'add'});
  }

  if (recordState.formState === 1) {
    return (
      <div>
      <p>Single DOI <label className="slider-box"><span className="slider slide-right" onClick={(evt) => {evt.preventDefault(); toggleForm()}} /></label> Multiple DOIs</p>
      <MultiForm add={addRecord} check={checkRecord} resetRecords={resetRecords} />
      </div>
    );
  } else {
    return (
      <div>
      <p>Single DOI <label className="slider-box"><span className="slider slide-left" onClick={(evt) => {evt.preventDefault(); toggleForm()}} /></label> Multiple DOIs</p>
      <SingleForm add={addRecord} check={checkRecord} resetRecords={resetRecords} />
      </div>
    );
  }
}

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
