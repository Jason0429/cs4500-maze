import {GemPair} from 'maze/Common/Gem';
import {Color, isHex} from 'maze/Utility/Color';

export default function Tile({tileStr, treasure, homeColors, playerColors, goalColors}: { tileStr: string, treasure: GemPair,
  homeColors?: Color[], playerColors?: Color[], goalColors?: Color[]}): JSX.Element {

  const gems = treasure.gems;
  const gem1 = gems[0];
  const gem2 = gems[1];

  if (gem1 === undefined || gem2 === undefined) console.log(gem1, gem2);

  return (
      <div style={{display: 'table-row'}}>
        <h1 style={{
          fontSize: '4em', position:'absolute', padding: 0, margin: 0, height: '75px', width: '75px'}}>{tileStr}</h1>

        <img style={{
          position: 'relative',
          height: '10px',
          width: 'auto'
        }} src={`./gems/${gem1}.png`}/>

        <img style={{
          position: 'relative',
          height: '10px',
          width: 'auto'
        }} src={`./gems/${gem2}.png`}/>

        <div style={{display: 'flex'}}>
          {homeColors &&
            homeColors.map(homeColor => {
                const color = isHex(homeColor.color) ? `#${homeColor.color}` : homeColor.color;
                return (
                  <div style={{
                    position: 'relative',
                    width: '20px',
                    height: '20px',
                    backgroundColor: color
                  }}>
                  </div>)
              }
            )
          }
        </div>

        <div style={{display: 'flex'}}>
          {goalColors &&
            goalColors.map(goalColor => {
                const color = isHex(goalColor.color) ? `#${goalColor.color}` : goalColor.color;
                return (
                  <div style={{
                    position: 'relative',
                    width: '20px',
                    height: '20px',
                    backgroundColor: color
                  }}>
                    G
                  </div>)
              }
            )
          }
        </div>

        <div style={{display: 'flex'}}>
          {playerColors &&
            playerColors.map(playerColor => {
              const color = isHex(playerColor.color) ? `#${playerColor.color}` : playerColor.color;
              return (
                  <div style={{
                    position: 'relative',
                    top: 0,
                    left: 0,
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    borderRadius: 100
                  }}>
                  </div>)
              }
            )
          }
        </div>

      </div>
  );
}
