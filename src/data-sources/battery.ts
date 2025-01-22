import battery from "battery-level";

import { DataSource } from "./data-source";

export class BatteryDataSource extends DataSource<number> {
  public async read(): Promise<number> {
    const value = this.readCache() ?? (await battery());

    this.writeCache(value);

    return value;
  }
}
