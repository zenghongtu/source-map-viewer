import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SMLookup, ISource } from './utils';
import './style.scss';

interface ISourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  file: string;
  sourcesContent: string[];
  sourceRoot: string;
}
const App = () => {
  const [sourceMapObj, setSourceMapObj] = React.useState<ISourceMap | null>(
    null
  );

  const [position, setPosition] = React.useState<{
    line: number;
    column: number;
  }>({ line: 0, column: 0 });

  const [source, setSource] = React.useState<ISource | null>(null);

  const sourceMapLookupRef = React.useRef<null | SMLookup>(null);

  React.useEffect(() => {
    if (!sourceMapObj) {
      return;
    }

    console.log(sourceMapObj);
    (async () => {
      sourceMapLookupRef.current = await new SMLookup(sourceMapObj);
    })();
  }, [sourceMapObj]);

  React.useEffect(() => {
    if (!sourceMapLookupRef.current) {
      return;
    }
    console.log('position: ', position);

    const source = sourceMapLookupRef.current.getSource(
      position.line,
      position.column
    );
    console.log('source: ', source);

    setSource(source);
  }, [position]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filePath = event.target.value;
    if (!filePath) {
      return;
    }
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener('loadend', event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        try {
          setSourceMapObj(JSON.parse(result));
        } catch (err) {
          console.log('JSON.parse source map err: ', err);
        }
      }
    });

    reader.readAsText(file);
  };

  const handlePositionButtonClick = () => {
    const line = +(document.querySelector('#position-line') as HTMLInputElement)
      .value;

    const column = +(document.querySelector(
      '#position-column'
    ) as HTMLInputElement).value;

    setPosition({ line, column });
  };

  return (
    <div className="app-wrap">
      <header>
        <h2>Source Map Viewer</h2>
        <ol>
          <li>Select a Source-Map file</li>
          <li>Set row and column</li>
          <li>Confirm</li>
        </ol>
      </header>
      <div className="app-select-file">
        <label>
          <span> 👉👉:</span>
          <input
            type="file"
            name="upload-file"
            id="upload-file"
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="app-position-inputs">
        <label>
          <span>line:</span>
          <input
            placeholder="line"
            id="position-line"
            defaultValue={position.line}
            type="number"
          ></input>
        </label>
        <label>
          <span>column:</span>
          <input
            placeholder="column"
            id="position-column"
            defaultValue={position.column}
            type="number"
          ></input>
        </label>

        <button onClick={handlePositionButtonClick}>Confirm</button>
      </div>

      {sourceMapObj && (
        <ul className="app-source-map-obj">
          {sourceMapObj.sources.map(source => {
            return <li key={source}>{source}</li>;
          })}
        </ul>
      )}
      {source && (
        <div className="app-source-map-content">
          <div className="app-source-path"> {source.source}</div>
          {source.sourceContent && (
            <div className="app-source-map-source">
              {position.line > 20 && <div>...</div>}
              {source.sourceContent
                .split('\n')
                .map((line, i) => {
                  const active = i + 1 === source.line;

                  return (
                    <React.Fragment key={i + line}>
                      <pre className={active ? 'active-line' : ''}>
                        <span className="line-num">{`${
                          active ? '=>' : i + 1 + '  '
                        } ${line}`}</span>
                      </pre>
                      {active && source.column && (
                        <pre>
                          {' '}
                          <span className="line-num"></span>
                          {[...Array(source.column - 1)].map(_ => ' ')}▲
                        </pre>
                      )}
                    </React.Fragment>
                  );
                })
                .filter((l, i) => {
                  const { line } = source;
                  if (!line) {
                    return;
                  }
                  if (
                    (i < line && i + 15 > line) ||
                    (i > line && i - 15 < line)
                  ) {
                    return true;
                  }
                  return false;
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App></App>, document.getElementById('app'));
