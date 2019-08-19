// eslint-disable-next-line import/no-extraneous-dependencies
import { useRef, useEffect, useState as useStateByReact } from 'react';

function useMounted() {
  const isMounted = useRef(false);
  useEffect(
    () => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    },
    [],
  );
  return isMounted;
}

function useState(...args) {
  const isMounted = useMounted();

  const [state, setState] = useStateByReact(...args);
  const setStateProxy = (...params) => {
    if (isMounted.current) {
      setState(...params);
    }
  };

  return [state, setStateProxy];
}

export default useState;
