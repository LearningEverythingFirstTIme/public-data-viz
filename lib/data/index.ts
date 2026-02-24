import { WorldBankConnector } from './worldbank';
import { FREDConnector } from './fred';
import { CoinGeckoConnector } from './coingecko';
import { DataConnector, colorThemes, ColorThemeKey } from './connectors';

export { colorThemes };
export type { ColorThemeKey };

export const dataConnectors: DataConnector[] = [
  new WorldBankConnector(),
  new FREDConnector(),
  new CoinGeckoConnector(),
];

export function getConnector(id: string): DataConnector | undefined {
  return dataConnectors.find(c => c.id === id);
}

export function getAllConnectors(): DataConnector[] {
  return dataConnectors;
}
