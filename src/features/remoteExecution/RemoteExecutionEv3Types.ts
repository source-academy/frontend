export enum Ev3MotorTypes {
  LARGE = 'lego-ev3-l-motor',
  MEDIUM = 'lego-ev3-m-motor'
}

export type Ev3MotorData = {
  position: number;
  speed: number;
};

enum Ev3TouchSensorModes {
  TOUCH = 'TOUCH'
}

type Ev3TouchSensorData = {
  type: Ev3SensorTypes.TOUCH_SENSOR;
  mode: Ev3TouchSensorModes.TOUCH;
  value: boolean;
};

enum Ev3GyroSensorModes {
  ANGLE = 'GYRO-ANG',
  RATE = 'GYRO-RATE'
}

type Ev3GyroSensorAngleData = {
  mode: Ev3GyroSensorModes.ANGLE;
  value: number;
};

type Ev3GyroSensorRateData = {
  mode: Ev3GyroSensorModes.RATE;
  value: number;
};

type Ev3GyroSensorData = (Ev3GyroSensorAngleData | Ev3GyroSensorRateData) & {
  type: Ev3SensorTypes.GYRO_SENSOR;
};

enum Ev3ColorSensorColorValues {
  NONE,
  BLACK,
  BLUE,
  GREEN,
  YELLOW,
  RED,
  WHITE,
  BROWN
}

export const ev3ColorSensorColorValueToLabelMap = Object.freeze({
  [Ev3ColorSensorColorValues.NONE]: 'None',
  [Ev3ColorSensorColorValues.BLACK]: 'Black',
  [Ev3ColorSensorColorValues.BLUE]: 'Blue',
  [Ev3ColorSensorColorValues.GREEN]: 'Green',
  [Ev3ColorSensorColorValues.YELLOW]: 'Yellow',
  [Ev3ColorSensorColorValues.RED]: 'Red',
  [Ev3ColorSensorColorValues.WHITE]: 'White',
  [Ev3ColorSensorColorValues.BROWN]: 'Brown'
});

enum Ev3ColorSensorModes {
  COLOR = 'COL-COLOR',
  REFLECTED_LIGHT = 'COL-REFLECT',
  AMBIENT_LIGHT = 'COL-AMBIENT'
}

type Ev3ColorSensorColorData = {
  type: Ev3SensorTypes.COLOR_SENSOR;
  mode: Ev3ColorSensorModes.COLOR;
  value: Ev3ColorSensorColorValues;
};

type Ev3ColorSensorAmbientLightIntensityData = {
  mode: Ev3ColorSensorModes.AMBIENT_LIGHT;
  value: number;
};

type Ev3ColorSensorReflectedLightIntensityData = {
  mode: Ev3ColorSensorModes.REFLECTED_LIGHT;
  value: number;
};

type Ev3ColorSensorData =
  | Ev3ColorSensorColorData
  | Ev3ColorSensorAmbientLightIntensityData
  | Ev3ColorSensorReflectedLightIntensityData;

enum Ev3UltrasonicSensorModes {
  DISTANCE_CM = 'US-DIST-CM'
}

type Ev3UltrasonicSensorData = {
  type: Ev3SensorTypes.ULTRASONIC_SENSOR;
  mode: Ev3UltrasonicSensorModes.DISTANCE_CM;
  value: number;
};

export enum Ev3SensorTypes {
  COLOR_SENSOR = 'lego-ev3-color',
  GYRO_SENSOR = 'lego-ev3-gyro',
  TOUCH_SENSOR = 'lego-ev3-touch',
  ULTRASONIC_SENSOR = 'lego-ev3-us'
}

export type Ev3SensorData = {
  mode: Ev3ColorSensorModes | Ev3UltrasonicSensorModes | Ev3TouchSensorModes | Ev3GyroSensorModes;
  value:
    | Ev3ColorSensorData['value']
    | Ev3TouchSensorData['value']
    | Ev3UltrasonicSensorData['value']
    | Ev3GyroSensorData['value'];
};

export const ev3SensorModeToValueTransformerMap: {
  [key in Ev3SensorData['mode']]: (value: any) => string;
} = Object.freeze({
  [Ev3ColorSensorModes.AMBIENT_LIGHT]: (value: Ev3ColorSensorAmbientLightIntensityData['value']) =>
    `Ambient Light: ${value}`,
  [Ev3ColorSensorModes.COLOR]: (value: Ev3ColorSensorColorData['value']) =>
    `Color: ${ev3ColorSensorColorValueToLabelMap[value]}`,
  [Ev3ColorSensorModes.REFLECTED_LIGHT]: (
    value: Ev3ColorSensorReflectedLightIntensityData['value']
  ) => `Reflected Light: ${value}`,
  [Ev3GyroSensorModes.ANGLE]: (value: Ev3GyroSensorAngleData['value']) => `Angle: ${value}°`,
  [Ev3GyroSensorModes.RATE]: (value: Ev3GyroSensorRateData['value']) => `Rate: ${value}°/s`,
  [Ev3TouchSensorModes.TOUCH]: (value: Ev3TouchSensorData['value']) =>
    `Touch: ${value ? 'Yes' : 'No'}`,
  [Ev3UltrasonicSensorModes.DISTANCE_CM]: (value: Ev3UltrasonicSensorData['value']) =>
    `Dist: ${value}cm`
});

type DateNumber = number;

export type WithLastUpdated<T extends object> = T & { lastUpdated: DateNumber };

export type Ev3DevicePeripherals = Partial<{
  portA: WithLastUpdated<Ev3MotorData>;
  portB: WithLastUpdated<Ev3MotorData>;
  portC: WithLastUpdated<Ev3MotorData>;
  portD: WithLastUpdated<Ev3MotorData>;
  port1: WithLastUpdated<Ev3SensorData>;
  port2: WithLastUpdated<Ev3SensorData>;
  port3: WithLastUpdated<Ev3SensorData>;
  port4: WithLastUpdated<Ev3SensorData>;
}>;
