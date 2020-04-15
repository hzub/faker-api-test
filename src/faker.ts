import { resolve, join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { v4 } from "uuid";
import _ from "lodash";
import faker from "faker";
import {
  CmdNode,
  FakerNode,
  ArrayNode,
  Node,
  EmptyNode,
  FakeDataEntry,
  KeyedFakedData,
} from "./types";
import { expandArrays, expandKeys, buildAst } from "./ast";

let seedSequence = 1;

export const generateFakerData = (
  root: Node
): { [k: string]: FakeDataEntry } => {
  const genFakeKeyValueList = (input: Node): FakerNode[] => {
    if (input instanceof FakerNode) {
      return [input];
    }
    return _.flatten(input.children.map((x) => genFakeKeyValueList(x)));
  };

  const getFakedValue = (cmd: string) => {
    const properFakerCmd =
      cmd.indexOf(":") > -1 ? cmd.substr(0, cmd.indexOf(":")) : cmd;
    try {
      if (cmd.endsWith(":static")) {
        faker.seed(++seedSequence);
      }
      return faker.fake(`{{${properFakerCmd}}}`).toString();
    } catch {
      return "ERROR";
    }
  };

  const fakerList: FakeDataEntry[] = genFakeKeyValueList(expandArrays(root))
    .map((node) => ({
      cmd: node.fakerCmd,
      key: node.expandedKey,
      // nodeId: node.nodeId,
      value: "",
    }))
    .sort((a, b) => {
      return (
        Number(a.cmd.endsWith(":static")) - Number(b.cmd.endsWith(":static"))
      );
    })
    .map((fakeEntry) => {
      return {
        ...fakeEntry,
        value: getFakedValue(fakeEntry.cmd),
      };
    });

  const ret: any = {};

  fakerList.forEach((e) => {
    ret[e.key] = e;
  });

  return ret;
};

export const feedTreeWithFakerData = (
  node: Node,
  fakerData: KeyedFakedData
): any => {
  if (node instanceof ArrayNode) {
    return node.children.map((x) => feedTreeWithFakerData(x, fakerData));
  }
  if (node instanceof FakerNode) {
    return fakerData[node.expandedKey].value;
  }
  const object: any = {};

  node.children.forEach((c) => {
    object[c.key] = feedTreeWithFakerData(c, fakerData);
  });

  return object;
};
