// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useRef, useEffect } from 'react';

function useState(...args) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [state, setState] = React.useState(...args);
  const setStateProxy = (...params) => {
    if (isMounted.current) {
      setState(...params);
    }
  };

  return [state, setStateProxy];
}

export default useState;
