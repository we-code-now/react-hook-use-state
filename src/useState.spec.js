import React from 'react';

import {
  wait,
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import useState from './useState';

const DELAY_IN_MS = 1000;
const WAIT_TIME_IN_MS = DELAY_IN_MS * 2;

function withUseState(useStateFn) {
  return ({ initialCount = 0 }) => {
    const [count, setCount] = useStateFn(initialCount);
    const increase = () => setCount(prevCount => prevCount + 1);

    return (
      <div>
        <span data-testid="count">{count}</span>
        <button type="button" onClick={increase}>
          Increase Now
        </button>
        <button
          type="button"
          onClick={() => setTimeout(increase, DELAY_IN_MS)}
        >
          Increase Delay
        </button>
      </div>
    );
  };
}

const CounterWithLibUseState = withUseState(useState);
const CounterWithReactUseState = withUseState(React.useState);

describe('useState.js', () => {
  afterEach(cleanup);

  describe('useState()', () => {
    function waitInMilliseconds(milliseconds) {
      const startTime = Date.now();
      return wait(() => {
        const elapsedTimeInMilliseconds = Date.now() - startTime;
        if (elapsedTimeInMilliseconds >= milliseconds) {
          return true;
        }
        throw new Error();
      });
    }

    it('should work with "Increase Now" click', () => {
      const { getByText, getByTestId } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Now/i));
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should work with "Increase Delay" click', async () => {
      const { getByText, getByTestId } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should move on with "Increase Delay" click after component is unmounted (lib.useState())', async () => {
      const {
        unmount,
        getByText,
        getByTestId,
      } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      unmount();

      const spy = jest.spyOn(console, 'error');
      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should log error with "Increase Delay" click after component is unmounted (React.useState())', async () => {
      const {
        unmount,
        getByText,
        getByTestId,
      } = render(
        <CounterWithReactUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Delay/i));
      unmount();

      const spy = jest.spyOn(console, 'error');
      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
