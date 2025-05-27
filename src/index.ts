import { WeakRefMap } from '@ofigelov/weakrefmap';

type Key =
  | string
  | number
  | boolean
  | null
  | undefined
  | Key[]
  | { [key: string]: Key };

const serialize = (data: Key) => JSON.stringify(data);

type NewableStore<
  TStore,
  // any нужен для вывода типов
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TConstructorParameters extends any[],
> = {
  new (...params: TConstructorParameters): TStore;
};

/**
 * Фабрика, предназначенная для дженерик сторов,
 * помогает избежать дублирования создания одинаковых сторов.
 */
export class StoreFactory<
  TStore extends {},
  // any нужен для вывода типов
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TConstructorParameters extends any[],
> {
  private storage = new WeakRefMap<TStore>();

  private singleInstanceKey = Math.random().toString();

  constructor(
    private readonly store: NewableStore<TStore, TConstructorParameters>,
  ) {}

  public getInstance = (key: Key, ...params: TConstructorParameters): TStore => {
    const keyHash = serialize(key);

    const store = this.storage.get(keyHash);

    if (!store) {
      const createdStorage = new this.store(...params);

      this.storage.set(keyHash, createdStorage);

      return createdStorage;
    }

    return store;
  };

  /**
   * метод для получения инстанса без использования ключа,
   * т.е. возможен только инстанс, похоже на синглтон, пока есть потребители
   */
  public getSingleInstance = (...params: TConstructorParameters) => {
    return this.getInstance(this.singleInstanceKey, ...params);
  };
}
