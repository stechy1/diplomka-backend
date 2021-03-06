import CustomMatcherResult = jest.CustomMatcherResult;
import expect = jest.Expect;
import { matcherHint, printReceived, stringify } from 'jest-matcher-utils';

const passMessage = (received, argument, _) => () => {
  return `${matcherHint('.toMatchStimulatorState')}

  Stimulator state match expected value:
  ${printReceived(received)}`;
};

const failMessage = (received, argument, problemKey) => () => {
  return `${matcherHint('.toMatchStimulatorState')}
  Experiment's property '${problemKey}' does not match.
  \treceived: ${stringify(received[problemKey])}
  \texpected: ${stringify(argument[problemKey])}`;
};

expect.extend({
  toMatchStimulatorStateType(received: jest.stimulator.StimulatorStateDataType, argument: jest.stimulator.StimulatorStateDataValues): CustomMatcherResult {
    let passing = true;

    expect(received).toEqual(
      expect.objectContaining(argument)
    );

    let func = passing ? passMessage : failMessage;

    return {
      pass: passing,
      message: func(received, argument, null),
    };
  }
})
