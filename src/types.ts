import _ from "lodash";

export interface FakeDataEntry {
  cmd: string;
  key: string;
  value?: string;
}

export class Node {
  public key: string = "";
  public expandedKey: string = "";
  public children: Node[] = [];
  constructor() {}
  static clone(src: Node) {
    return _.cloneDeep(src);
  }
}

export type KeyedFakedData = {
  [k: string]: FakeDataEntry;
};

export class FakerNode extends Node {
  public fakerCmd: string = "";
}
export class CmdNode extends Node {
  public cmd: string = "";
}
export class ArrayNode extends Node {}

export class EmptyNode extends Node {}
