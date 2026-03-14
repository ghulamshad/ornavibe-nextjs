import { WebStorage } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Avoid redux-persist warning on server / during SSR by using a noop storage there.
const createNoopStorage = (): WebStorage => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, _value: string) {
      return Promise.resolve();
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage: WebStorage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

export default storage;
