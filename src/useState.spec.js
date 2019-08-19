import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  wait, render, cleanup, fireEvent,
} from '@testing-library/react';

import useState from './useState';

function withUseState(useStateFn) {
  return ({ initialCount = 0 }) => {
    const [count, setCount] = useStateFn(initialCount);
    return (
      <div>
        <span data-testid="count">{count}</span>
        <button type="button" onClick={() => setCount((prevCount) => prevCount + 1)}>
          Increase Sync
        </button>
        <button
          type="button"
          onClick={() => {
            setTimeout(() => {
              setCount((prevCount) => prevCount + 1);
            }, 1e3);
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
    function waitInSeconds(seconds) {
      const startTime = Date.now();
      return wait(() => {
        const elapsedTimeInSeconds = (Date.now() - startTime) / 1e3;
        if (elapsedTimeInSeconds >= seconds) {
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

      await waitInSeconds(3);
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
      await waitInSeconds(3);
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
      await waitInSeconds(3);
      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
