import { createQueryKeys } from '@lukemorales/query-key-factory';
import Constants from 'src/commons/utils/Constants';

const baseUrlJs = Constants.sicpBackendUrl + 'json/';
const baseUrlPy = Constants.sicpBackendUrl + 'json_py/';
const extension = '.json';

export const sicp = createQueryKeys('sicp', {
  sectionJs: (section: string) => ({
    queryKey: ['js', section],
    queryFn: async ({ signal }) => {
      const res = await fetch(baseUrlJs + section + extension, { signal });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
  }),
  sectionPy: (section: string) => ({
    queryKey: ['py', section],
    queryFn: async ({ signal }) => {
      const res = await fetch(baseUrlPy + section + extension, { signal });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return await res.json();
    },
  }),
});
