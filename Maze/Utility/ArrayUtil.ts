import {NumUtil} from './Number';

export function rotate<T>(arr: T[], n: number): T[] {
  n = NumUtil.mod(n, arr.length);
  return arr.slice(n, arr.length).concat(arr.slice(0, n));
}
