import { ARG, FIELD, NONE, STATIC, VAR } from "./utils.js";

export class SymbolTable {
  constructor() {
    this.classTable = [];
    this.subroutineTable = [];
  }

  reset() {
    this.subroutineTable = [];
  }

  define(name, type, kind) {
    const index = this.varCount(kind);
    const entry = { name, type, kind, index };

    if (kind === STATIC || kind === FIELD) {
      this.classTable.push(entry);
    } else if (kind === ARG || kind === VAR) {
      this.subroutineTable.push(entry);
    }
  }

  varCount(kind) {
    const table = this._getTableByKind(kind);
    return table.filter((variable) => variable.kind === kind).length;
  }

  kindOf(name) {
    const entry = this._find(name);
    return entry?.kind ?? NONE;
  }

  typeOf(name) {
    const entry = this._find(name);
    return entry.type;
  }

  indexOf(name) {
    const entry = this._find(name);
    return entry.index;
  }

  _find(name) {
    return (
      this.subroutineTable.find((variable) => variable.name === name) ||
      this.classTable.find((variable) => variable.name === name)
    );
  }

  _getTableByKind(kind) {
    if (kind === STATIC || kind === FIELD) return this.classTable;
    if (kind === ARG || kind === VAR) return this.subroutineTable;
  }
}
