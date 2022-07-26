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
  fizzBuzz:
    '%09FizzBuzz%09%09%09%09%09%0AJEQ%20E2%20F2%20A37%09Exit%20if%20acc%20reaches%20limit%093%0932%090%09100%09%0AINC%20E2%09Increment%20acc%09%09122%09%09%09%0ADUP%20E2%09Duplicate%20acc%20for%20incoming%20mod%09%09122%09%09%09%0ADUP%20C14%09Duplicate%2015%20for%20incoming%20mod%09%09105%09%09%09%0AMOD%20E2%20C14%09Mod%20acc%20and%2015%09%0970%09%09%09%0AJNE%20E2%20E8%20A13%09Compare%20mod%20and%200%09%09%09%09%09%0APOP%20E2%09Remove%20mod%20result%20for%20if%095%0932%090%09%09%0ACOPY%20D14%20F4%09Copy%20FizzBuzz%20to%20free%20space%09%09122%09%09%09%0AJSE%20F4%20A2%09While%20F4%20or%20back%20to%20top%09%09122%09%09%09%0APRINTASCII%20F4%09Print%20top%20of%20F4%09%09117%09%09%09%0AJUMP%20A10%09Check%20for%20more%20characters%09%0966%09%09%09%0APOP%20E2%09Mod%2015%20was%20not%200%20check%20for%203%09%09%09%09%09%0ADUP%20E2%09Duplicate%20acc%20for%20incoming%20mod%0915%0932%09%09%09%0ADUP%20C2%09Duplicate%203%20for%20incoming%20mod%09%09122%09%09%09%0AMOD%20E2%20C2%09Mod%20acc%20and%203%09%09122%09%09%09%0AJNE%20E2%20E8%20A23%09Compare%20mod%20and%200%09%09117%09%09%09%0APOP%20E2%09Remove%20mod%20result%20for%20if%09%0966%09%09%09%0ACOPY%20D2%20F4%09Copy%20Fizz%20to%20free%20space%09%09122%09%09%09%0AJSE%20F4%20A2%09While%20F4%20or%20back%20to%20top%09%09122%09%09%09%0APRINTASCII%20F4%09Print%20top%20of%20F4%09%09105%09%09%09%0AJUMP%20A20%09Check%20for%20more%20characters%09%0970%09%09%09%0APOP%20E2%09Mod%203%20was%20not%200%20check%20for%205%09%09%09%09%09%0ADUP%20E2%09Duplicate%20acc%20for%20incoming%20mod%09%09%09%09%09%0ADUP%20C8%09Duplicate%205%20for%20incoming%20mod%09%09%09%09%09%0AMOD%20E2%20C8%09Mod%20acc%20and%2015%09%09%09%09%09%0AJNE%20E2%20E8%20A33%09Compare%20mod%20and%200%09%09%09%09%09%0APOP%20E2%09Remove%20mod%20result%20for%20if%09%09%09%09%09%0ACOPY%20D8%20F4%09Copy%20Buzz%20to%20free%20space%09%09%09%09%09%0AJSE%20F4%20A2%09While%20F4%20or%20back%20to%20top%09%09%09%09%09%0APRINTASCII%20F4%09Print%20top%20of%20F4%09%09%09%09%09%0AJUMP%20A30%09Check%20for%20more%20characters%09%09%09%09%09%0APOP%20E2%09No%20mod%20so%20remove%20mod%20for%20else%09%09%09%09%09%0ADUP%20E2%09Duplicate%20acc%20for%20printing%09%09%09%09%09%0APRINT%20E2%09Print%20acc%09%09%09%09%09%0AJUMP%20A2%09Back%20to%20top%09%09%09%09%09%0AEXIT%09Exit%20program%09%09%09%09%09%0A%09%09%09%09%09%09',
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
    setInput(nextInput.map((row) => row.map((cell) => (cell ? cell : { value: '' }))));
  };

  const addRow = () => {
    setInput((input) => [...input, Array.from(new Array(input[0].length), () => ({ value: '' }))]);
  };

  const addColumn = () => {
    setInput((input) => {
      const nextInput = [];

      input.forEach((row) => {
        nextInput.push([...row, { value: '' }]);
      });

      return nextInput;
    });
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
            <option value={'--'}>--</option>
            <option value={'helloWorld'}>Hello World</option>
            <option value={'fizzBuzz'}>FizzBuzz</option>
          </select>
        </label>
      </div>

      <button onClick={addRow}>Add row</button>
      <button onClick={addColumn}>Add column</button>

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
