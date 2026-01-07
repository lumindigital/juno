import {
    AddExpression,
    DivideExpression,
    ExponentExpression,
    FloatCastExpression,
    IntCastExpression,
    ModulusExpression,
    MultiplyExpression,
    SubtractExpression,
} from './classes.js';

export function add(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): AddExpression {
    return new AddExpression(`${leftSide} + ${rightSide}`);
}

export function subtract(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): SubtractExpression {
    return new SubtractExpression(`${leftSide} - ${rightSide}`);
}

export function multiply(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): MultiplyExpression {
    return new MultiplyExpression(`${leftSide} * ${rightSide}`);
}

export function divide(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): DivideExpression {
    return new DivideExpression(`${leftSide} / ${rightSide}`);
}

export function modulus(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): ModulusExpression {
    return new ModulusExpression(`${leftSide} % ${rightSide}`);
}

export function exponent(
    leftSide: IntCastExpression | FloatCastExpression,
    rightSide: IntCastExpression | FloatCastExpression | number,
): ExponentExpression {
    return new ExponentExpression(`${leftSide} ** ${rightSide}`);
}
