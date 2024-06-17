/*

// Example usage:
const counter = new LargeNumber('1e18');
console.log(counter.getValue().toString()); // Output: "1000000000000000000"

counter.increment('1e18');
console.log(counter.getValue().toString()); // Output: "2000000000000000000"

counter.decrement('5e17');
console.log(counter.getValue().toString()); // Output: "1500000000000000000"

*/


class LargeNumber {
  constructor(initialValue = 0n) {
    this.value = BigInt(initialValue);
  }

  increment(by = 1n) {
    this.value += BigInt(by);
    return this.value;
  }

  decrement(by = 1n) {
    this.value -= BigInt(by);
    return this.value;
  }

  multiply(by) {
    this.value *= BigInt(by);
    return this.value;
  }

  divide(by) {
    this.value /= BigInt(by);
    return this.value;
  }

  getValue() {
    return this.value;
  }

  getValueInENotation() {
    const valueStr = this.value.toString();
    const exponent = valueStr.length - 1;
    const coefficient = valueStr[0] + '.' + valueStr.slice(1, 5);
    return `${coefficient}e+${exponent}`;
  }


  setValue(newValue) {
    this.value = BigInt(newValue);
  }
}
