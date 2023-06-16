import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';
configure({ adapter: new Adapter() });

// Mock ResizeObserver in tests
global.ResizeObserver = require('resize-observer-polyfill');
