import { Ast, AstFor, AstIf, AstWhile, parseMultiple, Parser } from "./index"
import { Tokens } from "./tokens"

const skipExport = (tokens: Tokens) => {
  if (tokens.peek() === "exports") tokens.skip()
}

export const parseClass: Parser = (tokens: Tokens): Ast | null => {
  skipExport(tokens)
  if (tokens.isEmpty() || tokens.peek() === "}" || tokens.peek() !== "class") return null

  tokens.skip()
  const name = tokens.read()
  const self: Ast = { kind: "object", name, type: "class", body: [] }

  tokens.readTo("{")

  for (const child of parseClassBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

function* parseClassBody(tokens: Tokens): Generator<Ast | null> {
  const parsers: Array<Parser> = [parseClassMethod]

  for (const parsed of parseMultiple(parsers, tokens)) {
    yield parsed
  }

  return null
}

const parseClassMethod: Parser = (tokens: Tokens): Ast | null => {
  if (tokens.isEmpty()) return null
  const isMethod = (input: Array<string>): boolean => {
    if (input.length === 0) return false
    else if (input[0].includes("(")) return true
    else if (input[0] === "get" || input[0] === "set") return true
    else if (input[0] === "static") return true
    else return input[1] === "=" && input[2].startsWith("(")
  }

  if (!isMethod(tokens.peekN(3))) return null
  if (tokens.peek() === "get" || tokens.peek() === "set" || tokens.peek() === "static") tokens.skip()

  let name = tokens.read()
  if (name.includes("(")) name = name.slice(0, name.indexOf("("))

  tokens.readTo("{")

  const self: Ast = { kind: "object", type: "method", name, body: [] }

  for (const child of parseBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

export const parseFunction: Parser = (tokens: Tokens): Ast | null => {
  skipExport(tokens)
  const isFunction = (declaration: string): boolean => {
    if (declaration.startsWith("func")) return true
    else return declaration === "const"
  }
  if (tokens.isEmpty() || !isFunction(tokens.peek())) return null

  tokens.skip()

  let name = tokens.read()
  if (name.includes("(")) {
    name = name.slice(0, name.indexOf("("))
  }

  tokens.readTo("{")

  const self: Ast = { kind: "object", name, type: "function", body: [] }

  for (const child of parseBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

export const parseIf: Parser = (tokens): Ast | null => {
  if (tokens.isEmpty() || tokens.peek() === "}" || tokens.peek() !== "if") return null

  const name = tokens.readTo("if")
  const self: AstIf = { kind: "if", name, ifBody: [], elseBody: [], else: false }
  tokens.readTo("{")
  for (const child of parseBody(tokens)) {
    if (child === null) break
    self.ifBody.push(child)
  }

  tokens.readTo("}")
  self.else = tokens.peek() === "else"

  if (self.else) {
    tokens.readTo("{")

    for (const child of parseBody(tokens)) {
      if (child === null) break
      self.elseBody.push(child)
    }

    tokens.readTo("}")
  }

  return self
}

export const parseFor: Parser = (tokens: Tokens): Ast | null => {
  if (tokens.isEmpty() || tokens.peek() === "}" || tokens.peek() !== "for") return null

  const name = tokens.readTo("for")
  tokens.readTo("{")
  const self: AstFor = { kind: "for", name, body: [] }

  for (const child of parseBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

export const parseWhile: Parser = (tokens: Tokens): Ast | null => {
  if (tokens.isEmpty() || tokens.peek() === "}" || tokens.peek() !== "while") return null

  const name = tokens.readTo("while")
  tokens.readTo("{")
  const self: AstWhile = { kind: "while", name, body: [] }

  for (const child of parseBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

function* parseBody(tokens: Tokens): Generator<Ast | null> {
  const parsers: Array<Parser> = [parseIf, parseFor, parseWhile]

  for (const parsed of parseMultiple(parsers, tokens)) {
    yield parsed
  }

  return null
}

function* parseRoot(tokens: Tokens): Generator<Ast | null> {
  const parsers = [parseClass, parseFunction]

  for (const parsed of parseMultiple(parsers, tokens)) {
    yield parsed
  }

  return null
}

export const parseJavascript = (tokens: Tokens): Array<Ast> => {
  const ast = []

  for (const parsed of parseRoot(tokens)) {
    if (parsed === null) break
    ast.push(parsed)
  }

  return ast
}
