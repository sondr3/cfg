import { Counter } from "./counter"
import { Ast } from "./parsers"

export type Cfg = CfgRoot | CfgObject | CfgIf | CfgFor | CfgWhile

export type CfgRoot = { kind: "root"; name: string; body: Cfg[] }
export type CfgObject = { kind: "object"; type: string; name: string; body: Cfg[] }
export type CfgIf = { kind: "if"; name: string; else: boolean; body: Cfg[]; elseBody: Cfg[] }
export type CfgFor = { kind: "for"; name: string; body: Cfg[] }
export type CfgWhile = { kind: "while"; name: string; body: Cfg[] }

const bodyIsTuple = (parent: Cfg, body: Ast[] | [Ast[], Ast[]]): body is [Ast[], Ast[]] => {
  return body.length === 2 && parent.kind === "if"
}

export const constructCFG = (ast: Ast[]): Cfg => {
  return internalConstructor(ast, new Counter(), { kind: "root", name: "root", body: [] })
}

const internalConstructor = (ast: Ast[], counter: Counter, parent: Cfg, elseBranch = false): Cfg => {
  const children = []

  for (const node of ast) {
    const [it, body] = astToCfg(node, counter)
    children.push(it)
    switch (it.kind) {
      case "root":
      case "object":
      case "for":
      case "while":
        if (bodyIsTuple(it, body)) throw new Error("This shouldn't happen")
        it.body.push(internalConstructor(body, counter, it))
        break
      case "if":
        if (!bodyIsTuple(it, body)) throw new Error("This shouldn't happen")
        it.body.push(internalConstructor(body[0], counter, it))
        it.elseBody.push(internalConstructor(body[1], counter, it, true))
        break
    }
  }

  if (elseBranch && parent.kind === "if") parent.elseBody = children
  else parent.body = children

  return parent
}

const astToCfg = (ast: Ast, counter: Counter): [Cfg, Ast[]] | [Cfg, [Ast[], Ast[]]] => {
  switch (ast.kind) {
    case "for":
    case "while":
      return [{ kind: ast.kind, name: counter.name(ast), body: [] }, ast.body]
    case "object":
      return [{ kind: "object", type: ast.type, name: ast.name, body: [] }, ast.body]
    case "if":
      return [
        { kind: "if", name: counter.name(ast), else: ast.else, body: [], elseBody: [] },
        [ast.ifBody, ast.elseBody],
      ]
  }
}
