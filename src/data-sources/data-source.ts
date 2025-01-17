export abstract class DataSource<T> {
  public abstract read(): Promise<T>;
}
