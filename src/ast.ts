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
} from "./types";

const LEVEL_LIMIT = 16;
const INPUT_FILE = "src1.json";

export const buildAst = (key: string, inputObject: any, level: number = 0) => {
  if (level > LEVEL_LIMIT) throw new Error("too much");

  console.log(_.repeat("-", level), "Processing AST:", key);

  if (_.isString(inputObject)) {
    if ((inputObject as string).indexOf("@") === 0) {
      const fakerNode = new CmdNode();
      fakerNode.cmd = inputObject;
      fakerNode.key = key;
      return fakerNode;
    }
    const fakerNode = new FakerNode();
    fakerNode.key = key;
    fakerNode.fakerCmd = inputObject;
    return fakerNode;
  }

  if (_.isArray(inputObject)) {
    const arrayNode = new ArrayNode();
    arrayNode.key = key;
    arrayNode.children = inputObject.map((e: any, i: number) =>
      buildAst(`${key}-${i}`, e, level + 1)
    );
    return arrayNode;
  }

  if (_.isObject(inputObject)) {
    const node = new Node();
    node.key = key;
    const childrenNodes = Object.keys(inputObject).map((childKey: string) => {
      return buildAst(childKey, (inputObject as any)[childKey], level + 1);
    });
    node.children = childrenNodes;
    return node;
  }

  return new EmptyNode();
};

export const expandArrays = (input: Node): Node => {
  if (input instanceof ArrayNode) {
    const repeatCmdNode = input.children.find((c) => c instanceof CmdNode);
    if (
      repeatCmdNode instanceof CmdNode &&
      repeatCmdNode.cmd.indexOf("@repeat") === 0
    ) {
      let repeatTimes = 1;
      try {
        repeatTimes = parseInt(
          repeatCmdNode.cmd.substr(repeatCmdNode.cmd.indexOf(":") + 1),
          10
        );
      } catch {}
      input.children = input.children.filter((c) => c !== repeatCmdNode);
      const oneCopy = [...input.children];
      for (let i = 0; i < repeatTimes - 1; i++) {
        input.children = [
          ...input.children,
          ...oneCopy.map((c) => {
            const newZ = Node.clone(c);
            newZ.key = newZ.key + "-rep" + i;
            return newZ;
          }),
        ];
      }
    }
  }

  input.children = input.children.map((x) => expandArrays(x));
  return input;
};

export const expandKeys = (input: Node, key = ""): Node => {
  input.expandedKey = key ? `${key}.${input.key}` : input.key;
  input.children = input.children.map((c) => expandKeys(c, input.expandedKey));
  return input;
};
