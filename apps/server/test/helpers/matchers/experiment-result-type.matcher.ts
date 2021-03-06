import CustomMatcherResult = jest.CustomMatcherResult;
import expect = jest.Expect;

import { matcherHint, printReceived, stringify } from 'jest-matcher-utils';

const passMessage = (received, argument, _) => () => {
  return `${matcherHint('.toMatchExperimentResultType')}

  Experiment match all expected values:
  ${printReceived(received)}`;
};

const failMessage = (received, argument, problemKey) => () => {
  return `${matcherHint('.toMatchExperimentResultType')}
  Experiment result's property '${problemKey}' does not match.
  \treceived: ${stringify(received[problemKey])}
  \texpected: ${stringify(argument[problemKey])}`;
};

const specialPredicates: Record<string, (lhs: unknown, rhs: unknown) => boolean> = {
  // vyplň speciální predikáty
};

expect.extend({
  toMatchExperimentResultType(received: jest.experimentResults.ExperimentResultType, argument: jest.experimentResults.ExperimentResultEntityType): CustomMatcherResult {
    const restrictedKeys = ['id', 'date', 'filename'];
    const keys = Object.keys(argument).filter((value) => !restrictedKeys.includes(value));
    const standardPredicate = (lhs, rhs) => this.equals(lhs, rhs);

    let passing = true;
    let problemKey = null;

    for (const key of keys) {
      let predicate = standardPredicate;
      if (specialPredicates[key]) {
        predicate = specialPredicates[key];
      }
      if (!predicate(received[key], argument[key])) {
        passing = false;
        problemKey = key;
        break;
      }
    }

    let func = passing ? passMessage : failMessage;

    return {
      pass: passing,
      message: func(received, argument, problemKey),
    };
  }
})
