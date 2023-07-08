export type Connector = '│' | '─' | '┐' | '└' | '┌' | '┘' | '┬' | '├' | '┴' | '┤' | '┼';

/**
 * A readonly array containing all the ConnectorSymbols.
 * Useful for checking membership when deserializing.
 */
export const CONNECTORS = ['│','─','┐','└','┌','┘','┬','├','┴','┤','┼'] as const;

