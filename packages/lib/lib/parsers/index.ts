import { parseJava } from "./java"
import { parseJavascript } from "./javascript"
import { Tokens } from "./tokens"

export { parseJava } from "./java"
export { parseJavascript } from "./javascript"

export const isObject = (object: Ast): object is AstObject => object.kind === "object"
export const isIf = (object: Ast): object is AstIf => object.kind === "if"
export const isFor = (object: Ast): object is AstFor => object.kind === "for"
export const isWhile = (object: Ast): object is AstWhile => object.kind === "while"

export type AstObject = { kind: "object"; name: string; type: string; body: Array<Ast> }
export type AstIf = { kind: "if"; else: boolean; name: string; ifBody: Array<Ast>; elseBody: Array<Ast> }
export type AstFor = { kind: "for"; name: string; body: Array<Ast> }
export type AstWhile = { kind: "while"; name: string; body: Array<Ast> }

export type Ast = AstObject | AstIf | AstFor | AstWhile

export type Parser = (tokens: Tokens) => Ast | null

export const parse = (language: "java" | "javascript", input: string): Array<Ast> => {
  const tokens = new Tokens(input)
  switch (language) {
    case "java":
      return parseJava(tokens)
    case "javascript":
      return parseJavascript(tokens)
  }
}

export function* parseMultiple(parsers: Array<Parser>, tokens: Tokens): Generator<Ast | null> {
  let failures = new Array(parsers.length).fill(false)

  while (tokens.peek() !== "}") {
    if (tokens.isEmpty()) return null
    if (failures.every((p) => p)) {
      failures = failures.map(() => false)
      tokens.read()
    }
    for (let i = 0; i < parsers.length; i++) {
      tokens.preserve()
      const parsed = parsers[i](tokens)
      if (parsed === null) {
        failures[i] = true
        tokens.restore()
      } else {
        failures = failures.map(() => false)
        i = 0
        yield parsed
      }
    }
  }

  return null
}
