// Lab 9: Business logic บริสุทธิ์ ไม่พึ่ง DB/HTTP
function checkVoltage(voltage) {
  if (voltage > 250) return 'CRITICAL';
  if (voltage >= 220) return 'NORMAL';
  return 'LOW';
}

module.exports = { checkVoltage };
