import type { Location, Params, NavigateFunction } from 'react-router';

type History = {
  navigate: NavigateFunction | null;
  location: Location | null;
  params: Readonly<Params> | null;
}

export const history: History = {
  navigate: null,
  location: null,
  params: null
}
