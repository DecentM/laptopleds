import dbus from "dbus-next";

import { DataSource } from "./data-source";

export class BrightnessDataSource extends DataSource<number> {
  private bus = dbus.sessionBus();

  public async read(): Promise<number> {
    try {
      const obj = await this.bus.getProxyObject(
        "local.org_kde_powerdevil",
        "/org/kde/Solid/PowerManagement/Actions/BrightnessControl",
      );

      const iface = await obj.getInterface(
        "org.kde.Solid.PowerManagement.Actions.BrightnessControl",
      );

      const value =
        this.readCache() ??
        (await iface.brightness()) / (await iface.brightnessMax());

      this.writeCache(value);

      return Number.isNaN(value) ? 0.5 : value;
    } catch {
      return 0.5;
    }
  }
}
