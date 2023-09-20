import { useContext } from 'react';
import { RecordContext } from './RecordContext';


export const TotalBar = () => {
  const { recordState } = useContext(RecordContext);
  //useEffect(() => {
  //  const new_attention = records.reduce((acc, current) => acc + current.score, 0);
  //  setTotalAttention(new_attention);
  //}, [records])

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

  return (
    <div className="total_bar">
      <div className="total_item"><label htmlFor="total_count">Total records</label> <span id="total_count">{recordState.recordList.length}</span></div>
      <div className="total_item"><label htmlFor="total_attention">Cumulative attention score</label> <span id="total_attention">{recordState.totalAttention}</span></div>
    </div>
  )
}
