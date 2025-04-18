export class SymbolTable {
  constructor() {
    this.table = {};
    this.n = 16;

    this.initialize();
  }

  initialize() {
    this.table = {
      R0: 0,
      R1: 1,
      R2: 2,
      R3: 3,
      R4: 4,
      R5: 5,
      R6: 6,
      R7: 7,
      R8: 8,
      R9: 9,
      R10: 10,
      R11: 11,
      R12: 12,
      R13: 13,
      R14: 14,
      R15: 15,
      SCREEN: 16384,
      KDB: 14576,
      SP: 0,
      LCL: 1,
      ARG: 2,
      THIS: 3,
      THAT: 4,
    };
  }

  addEntry(symbol, address) {
    this.table[symbol] = address;
  }

  contains(symbol) {
    return this.table.hasOwnProperty(symbol);
  }

  getAddress(symbol) {
    return this.table[symbol];
  }
}
