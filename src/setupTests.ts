import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';
configure({ adapter: new Adapter() });
