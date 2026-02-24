import { WorldBankConnector } from './worldbank';
import { FREDConnector } from './fred';
import { CoinGeckoConnector } from './coingecko';
import { AlphaVantageConnector } from './alphavantage';
import { NOAAConnector } from './noaa';
import { UNDataConnector } from './undata';
import { DataConnector, colorThemes, ColorThemeKey } from './connectors';

export { colorThemes };
export type { ColorThemeKey };
export { NOAAConnector, UNDataConnector };

export const dataConnectors: DataConnector[] = [
  new WorldBankConnector(),
  new FREDConnector(),
  new CoinGeckoConnector(),
  new AlphaVantageConnector(),
  new NOAAConnector(),
  new UNDataConnector(),
];

export function getConnector(id: string): DataConnector | undefined {
  return dataConnectors.find(c => c.id === id);
}

export function getAllConnectors(): DataConnector[] {
  return dataConnectors;
}
