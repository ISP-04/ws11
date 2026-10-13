const { checkVoltage } = require('../src/utils/voltageChecker');

describe('checkVoltage', () => {
  test('260V -> CRITICAL', () => {
    const voltage = 260; // Arrange
    const result = checkVoltage(voltage); // Act
    expect(result).toBe('CRITICAL'); // Assert
  });
  test('230V -> NORMAL', () => {
    const voltage = 230;
    const result = checkVoltage(voltage);
    expect(result).toBe('NORMAL');
  });
  test('200V -> LOW', () => {
    const voltage = 200;
    const result = checkVoltage(voltage);
    expect(result).toBe('LOW');
  });
});
