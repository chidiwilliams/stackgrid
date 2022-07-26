import React, { useEffect, useState } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { Interpreter } from 'stackgrid';
import './App.css';

/**
 * @type {{value: string}[][]}
 */
const ip = [];

/**
 * @type {({type: 'state', state: {value: string}[][]} | {type: 'log', log: string})[]}
 */
const initialDebug = [];

const examples = {
  helloWorld:
    '%09%09%09%09%0AJSE%20B2%20A5%0933%09%09%09%0APRINTASCII%20B2%09100%09%09%09%0AJUMP%20A2%09108%09%09%09%0AEXIT%09114%09%09%09%0A%09111%09%09%09%0A%0987%09%09%09%0A%0932%09%09%09%0A%0944%09%09%09%0A%09111%09%09%09%0A%09108%09%09%09%0A%09108%09%09%09%0A%09101%09%09%09%0A%0972%09%09%09%0A%09%09%09%09%0A%09%09%09%09%0A%09%09%09%09%0A%09%09%09%09%0A%09%09%09%09%0A%09%09%09%09%0A%09%09%09%09',
};

/**
 * @type {string[]}
 */
const initialLogs = [];

function App() {
  const [input, setInput] = useState(ip);
  const [debugs, setDebugs] = useState(initialDebug);
  const [logs, setLogs] = useState(initialLogs);

  useEffect(() => {
    onReset();
  }, []);

  const onReset = () => {
    const query = new URLSearchParams(window.location.search).get('q') || decodeURIComponent(examples.helloWorld);
    const queryInput = query.split('\n').map((row) => row.split('\t').map((cell) => ({ value: cell })));
    setInput(() => [...queryInput]);
    setLogs([]);
  };

  const collectDebug = (state) => {
    const deepCopy = state.map((row) => [...row.map((cell) => ({ ...cell }))]);
    setDebugs((debugs) => [...debugs, { type: 'state', state: deepCopy }]);
  };

  const onRun = () => {
    const rows = input.map((inputRow, rowIndex) => ({
      index: rowIndex,
      cells: inputRow.map((inputCell, colIndex) => ({
        index: colIndex,
        rowIndex: rowIndex,
        instruction: inputCell,
      })),
    }));

    setDebugs(() => []);

    const interpreter = new Interpreter(
      rows,
      null,
      (input) => {
        setLogs((logs) => [...logs, input]);
        setDebugs((debugs) => [...debugs, { type: 'log', log: input }]);
      },
      collectDebug
    );
    interpreter.interpret();
  };

  const onDebug = () => {
    const str = input.map((row) => row.map((cell) => cell.value).join('\t')).join('\n');
    const url = encodeURIComponent(str);
    console.log(url);
  };

  const onReplay = () => {
    let i = 0;
    const interval = setInterval(() => {
      if (i++ >= debugs.length - 1) {
        clearInterval(interval);
        return;
      }

      const debug = debugs[i];
      if (debug.type === 'state') {
        setInput(() => {
          const newInput = [...debug.state.map((row) => row.map((cell) => cell))];
          return newInput;
        });
      } else {
        setLogs((logs) => [...logs, debug.log]);
      }
    }, 500);
  };

  const onChangeData = (nextInput) => {
    setInput([...nextInput]);
  };

  return (
    <div className="App">
      <div style={{ marginBottom: 10 }}>
        <label>
          Examples
          <select
            style={{ marginLeft: 5 }}
            onChange={(event) => {
              const value = event.target.value;
              window.open(`?q=${examples[value]}`, '_self');
            }}
          >
            <option value={'helloWorld'}>Hello World</option>
          </select>
        </label>
      </div>
      <div>
        <Spreadsheet data={input} onChange={onChangeData}></Spreadsheet>
      </div>
      <button onClick={onRun}>Run</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onDebug}>Debug</button>
      <button onClick={onReplay}>Replay</button>
      <div>
        <h2>stdout</h2>
        <div>
          {logs.map((log, i) => (
            <span key={i}>{log}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
