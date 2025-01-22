export abstract class DataSource<T> {
  public abstract read(): Promise<T>;

  private cache: T | null = null;

  protected writeCache(value: T) {
    this.cache = value;
  }

  protected readCache() {
    return this.cache;
  }
}
