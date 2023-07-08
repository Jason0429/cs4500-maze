import React from 'react';
import './App.css';
import {IpcRendererEvent, IpcRenderer} from 'electron';
import {deserializeGameState, JSONGameResult} from 'maze/Utility/JSONGameState';
import {StateUpdate, GameOverUpdate, GameUpdate} from 'maze/Referee/ProcessObserver';
import State from './components/State';
import {serializeState} from 'maze/Serialize/GameState';
import {XGamesChannel} from 'maze/test_utility/XGamesChannel';
import {GameUpdateType} from 'maze/Referee/ProcessObserver';
const {ipcRenderer} = window.require('electron') as {ipcRenderer: IpcRenderer};

function App() {
  const [stateHistory, setStateHistory] = React.useState<StateUpdate[]>([]);
  const [curStateNo, setCurStateNo] = React.useState(0);
  const [gameResult, setGameResult] = React.useState<JSONGameResult | undefined>(undefined);

  React.useEffect(() => {
    const interval = setInterval(() => {
      ipcRenderer.send(XGamesChannel.GET_UPDATES);
    }, 100);

    const onUpdates = (_: IpcRendererEvent, updates: GameUpdate[]) => {
      setStateHistory([
        ...stateHistory,
        ...updates.filter(u => u.type === GameUpdateType.UPDATE) as StateUpdate[]
      ]);

      const gameResult = updates.find(u => u.type === GameUpdateType.GAME_OVER);
      if(gameResult !== undefined) setGameResult((gameResult as GameOverUpdate).result);
    }

    ipcRenderer.on(XGamesChannel.UPDATES, onUpdates);

    return () => {
      clearInterval(interval);
      ipcRenderer.removeListener(XGamesChannel.UPDATES, onUpdates);
    }
  }, [stateHistory]);

  function downloadTxtFile() {
    const stateUpdate = stateHistory[curStateNo];
    const state = deserializeGameState(stateUpdate.state);
    const testState = serializeState(state);
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(testState, null, 1)], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `gamestate-no-${curStateNo + 1}.json`;
    element.click();
  }

  return (
    <div className="App" style={{minHeight: '100vh'}}>
        {
          stateHistory.length > 0 ?
            <div>
              State {curStateNo + 1} / {stateHistory.length}
              <button disabled={curStateNo === 0} onClick={() => setCurStateNo(curStateNo - 1)}>
                ←
              </button>
              <button disabled={curStateNo === stateHistory.length - 1} onClick={() => setCurStateNo(curStateNo + 1)}>
                →
              </button>
              <button onClick={downloadTxtFile}>Save Referee State (JSON)</button>
              <State stateUpdate={stateHistory[curStateNo]}></State>
            </div>
            :
          'Game has not started yet.'
        }
    </div>
  );
}

export default App;
