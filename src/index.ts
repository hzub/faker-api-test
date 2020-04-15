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
import { expandArrays, expandKeys, buildAst } from "./ast";
import { generateFakerData, feedTreeWithFakerData } from "./faker";

const LEVEL_LIMIT = 16;
const INPUT_FILE = "src1.json";

const input = JSON.parse(
  readFileSync(join(process.cwd(), INPUT_FILE), "utf-8")
);

const AST = expandKeys(expandArrays(buildAst("root", input)));
const fakerData = generateFakerData(AST);
const output = feedTreeWithFakerData(AST, fakerData);

writeFileSync("output.json", JSON.stringify(output, null, "  "));
