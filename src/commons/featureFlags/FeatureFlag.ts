export class FeatureFlag<T> {
  private readonly _flagName: string;
  private readonly _defaultValue: T;
  private readonly _flagDesc?: string;

  get flagName(): string {
    return this._flagName;
  }
  get defaultValue(): T {
    return this._defaultValue;
  }
  get flagDesc(): string | undefined {
    return this._flagDesc;
  }

  constructor(flagName: string, defaultValue: T, flagDesc?: string) {
    this._flagName = flagName;
    this._defaultValue = defaultValue;
    this._flagDesc = flagDesc;
  }
}
