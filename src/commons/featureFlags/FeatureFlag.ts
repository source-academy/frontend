export class FeatureFlag<T> {
  private readonly _flagName: string;
  private readonly _defaultValue: T;
  private readonly _flagDesc?: string;
  private readonly _callback?: Function;

  get flagName(): string {
    return this._flagName;
  }
  get defaultValue(): T {
    return this._defaultValue;
  }
  get flagDesc(): string | undefined {
    return this._flagDesc;
  }
  onChange(newValue: T) {
    return this._callback?.(newValue);
  }

  constructor(
    flagName: string,
    defaultValue: T,
    flagDesc?: string,
    callback?: (newValue: T) => void
  ) {
    this._flagName = flagName;
    this._defaultValue = defaultValue;
    this._flagDesc = flagDesc;
    this._callback = callback;
    this.onChange(defaultValue);
  }
}
