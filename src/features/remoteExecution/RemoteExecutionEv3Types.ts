export type Ev3MotorData = {
  position: number;
  speed: number;
};

type Ev3TouchSensorData = {
  mode: 'TOUCH';
  value: boolean;
};

type Ev3GyroSensorAngleData = {
  mode: 'GYRO-ANG';
  value: number;
};

type Ev3GyroSensorRateData = {
  mode: 'GYRO-RATE';
  value: number;
};

type Ev3GyroSensorData = Ev3GyroSensorAngleData | Ev3GyroSensorRateData;

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

type Ev3ColorSensorColorData = {
  mode: 'COL-COLOR';
  value: Ev3ColorSensorColorValues;
};

type Ev3ColorSensorAmbientLightIntensityData = {
  mode: 'COL-AMBIENT';
  value: number;
};

type Ev3ColorSensorReflectedLightIntensityData = {
  mode: 'COL-REFLECT';
  value: number;
};

type Ev3ColorSensorData =
  | Ev3ColorSensorColorData
  | Ev3ColorSensorAmbientLightIntensityData
  | Ev3ColorSensorReflectedLightIntensityData;

type Ev3UltrasonicSensorData = {
  mode: 'US-DIST-CM';
  value: number;
};

export type Ev3SensorData =
  | Ev3TouchSensorData
  | Ev3GyroSensorData
  | Ev3ColorSensorData
  | Ev3UltrasonicSensorData;

type DateNumber = number;

export type WithLastUpdated<T extends object> = T & { lastUpdated: DateNumber };

export type Ev3DevicePeripherals = {
  portA?: WithLastUpdated<Ev3MotorData>;
  portB?: WithLastUpdated<Ev3MotorData>;
  portC?: WithLastUpdated<Ev3MotorData>;
  portD?: WithLastUpdated<Ev3MotorData>;
  port1?: WithLastUpdated<Ev3SensorData>;
  port2?: WithLastUpdated<Ev3SensorData>;
  port3?: WithLastUpdated<Ev3SensorData>;
  port4?: WithLastUpdated<Ev3SensorData>;
};
