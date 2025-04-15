import { NONE, STATIC, LOCAL, ARGUMENT, THIS } from "./utils.js";

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

    if (kind === STATIC || kind === THIS) {
      this.classTable.push(entry);
    } else if (kind === ARGUMENT || kind === LOCAL) {
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
    return entry?.type ?? NONE;
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
    if (kind === STATIC || kind === THIS) return this.classTable;
    if (kind === ARGUMENT || kind === LOCAL) return this.subroutineTable;
  }
}
