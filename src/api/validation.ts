import {
  type InputData,
  type Rule,
  type ValidationRules,
  either,
  isDate,
  isIn,
  isString,
  minLength,
  required,
  validate,
  validateObject
} from '../shared/deps/validation.ts';

function validateSearchCriteria(searchCriteriaJson: InputData): Rule[] {
  return [
    required,
    either([
      validateObject(true, {
        type: [required, isString, isIn(['css-selector'])],
        selector: [required, isString, minLength(1)],
        child: searchCriteriaJson?.child ? validateSearchCriteria(searchCriteriaJson) : []
      }),
      validateObject(true, {
        type: [required, isString, isIn(['node-name'])],
        nodeName: [required, isString, minLength(1)],
        child: searchCriteriaJson?.child ? validateSearchCriteria(searchCriteriaJson) : []
      })
    ])
  ];
}

function validateReport(): Rule[] {
  return validateObject(false, {
    type: [required, isString, isIn(['telegram'])],
    chatId: [required, isString, minLength(1)]
  });
}

function getValidationRules(searchCriteriaJson: InputData): ValidationRules {
  return {
    title: [required, isString, minLength(1)],
    pageUrl: [required, isString, minLength(1)],
    expirationDate: [required, isDate],
    searchCriteria: validateSearchCriteria(searchCriteriaJson),
    report: validateReport()
  }
}

export function validateTicketMonitoringRequest(json: InputData) {
  return validate(json, getValidationRules(json));
}
