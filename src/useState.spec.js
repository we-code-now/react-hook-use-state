import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  wait, render, cleanup, fireEvent,
} from '@testing-library/react';

import useState from './useState';

const ASYNC_TIMEOUT_IN_MS = 1e3;
const WAIT_TIME_IN_MS = ASYNC_TIMEOUT_IN_MS * 2;

function withUseState(useStateFn) {
  return ({ initialCount = 0 }) => {
    const [count, setCount] = useStateFn(initialCount);
    return (
      <div>
        <span data-testid="count">{count}</span>
        <button type="button" onClick={() => setCount(prevCount => prevCount + 1)}>
          Increase Sync
        </button>
        <button
          type="button"
          onClick={() => {
            setTimeout(() => {
              setCount(prevCount => prevCount + 1);
            }, ASYNC_TIMEOUT_IN_MS);
          }}
        >
          Increase Async
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

    it('should work with "near-sync" click', () => {
      const { getByText, getByTestId } = render(<CounterWithLibUseState initialCount={10} />);
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Sync/i));
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should work with async click', async () => {
      const { getByText, getByTestId } = render(<CounterWithLibUseState initialCount={10} />);
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Async/i));
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(getByTestId('count')).toHaveTextContent(/^11$/);
    });

    it('should log error with async click after component is unmounted (React.useState())', async () => {
      const { getByText, getByTestId, unmount } = render(
        <CounterWithReactUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Async/i));
      unmount();

      const spy = jest.spyOn(console, 'error');
      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('should move on with async click after component is unmounted (lib.useState())', async () => {
      const { getByText, getByTestId, unmount } = render(
        <CounterWithLibUseState initialCount={10} />,
      );
      expect(getByTestId('count')).toHaveTextContent(/^10$/);

      fireEvent.click(getByText(/Increase Async/i));
      unmount();

      const spy = jest.spyOn(console, 'error');
      await waitInMilliseconds(WAIT_TIME_IN_MS);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
