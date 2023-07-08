// import MemoryStream from 'memorystream';
// import { clientHandshake, MAX_NAME_WAITING_LENGTH_MS } from '../../../Server/Server';
// import { sleep } from '../../../Utility/Function';


// describe('client handshake', () => {
//   test('when the name returns before the timeout', async () => {
//     const stream = new MemoryStream();
//     clientHandshake(stream);
//     stream.write(JSON.stringify('name'));
//     await sleep(MAX_NAME_WAITING_LENGTH_MS + 50);
//     expect(stream.writableEnded).toBeFalsy();
//   })

//   test("when the name doesn't return before the timeout", async () => {
//     const stream = new MemoryStream();
//     clientHandshake(stream);
//     await sleep(MAX_NAME_WAITING_LENGTH_MS + 50);
//     expect(stream.writableEnded).toBeTruthy();
//   })
// })
