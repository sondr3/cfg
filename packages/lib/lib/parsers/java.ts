import { Ast, AstFor, AstIf, AstWhile, parseMultiple, Parser } from "./index"
import { Tokens } from "./tokens"

const skipVisibility = (tokens: Tokens) => {
  const token = tokens.peek()
  if (token == "private" || token == "public" || token === "protected") {
    tokens.skip()
  }
}

export const parseClass: Parser = (tokens: Tokens): Ast | null => {
  skipVisibility(tokens)
  if (tokens.isEmpty() || tokens.peek() === "}") return null
  if (tokens.peek() !== "class") return null

  tokens.skip()
  const name = tokens.read()
  const self: Ast = { kind: "object", name: name, type: "class", body: [] }

  tokens.readTo("{")

  for (const child of parseClassBody(tokens)) {
    if (child === null) break
    self.body.push(child)
  }

  tokens.readTo("}")

  return self
}

export function* parseClassBody(tokens: Tokens): Generator<Ast | null> {
  const parsers: Array<Parser> = [parseClass, parseMethod]
  for (const parsed of parseMultiple(parsers, tokens)) {
    yield parsed
  }

  return null
}

export const parseMethod: Parser = (tokens: Tokens): Ast | null => {
  skipVisibility(tokens)
  if (tokens.isEmpty() || tokens.peek() === "}" || tokens.peek() === "class") return null
  tokens.skip() // skip return type token

  let name = tokens.read()
  name = name.slice(0, name.indexOf("("))
  const self: Ast = { kind: "object", name: name, type: "method", body: [] }

  tokens.readTo("{")

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

export const parseCall: Parser = (tokens: Tokens): Ast | null => {
  if (tokens.isEmpty() || tokens.peek() === "}") return null

  if (tokens.peekN(3)[2] === "=") {
    tokens.skip(3)
  } else if (tokens.peekN(2)[1] === "=") {
    tokens.skip(2)
  }

  if (tokens.peek() === "new") tokens.skip()

  let name = tokens.read()

  if (!name.endsWith(");")) return null

  if (name.startsWith("this")) {
    name = name.slice("this.".length)
  }

  name = name.slice(0, name.indexOf("("))
  return { kind: "object", type: "call", name, body: [] }
}

export function* parseBody(tokens: Tokens): Generator<Ast | null> {
  const parsers: Array<Parser> = [parseIf, parseFor, parseWhile, parseCall]

  for (const parsed of parseMultiple(parsers, tokens)) {
    yield parsed
  }

  return null
}

export const parseJava = (tokens: Tokens): Array<Ast> => {
  const ast = []

  while (!tokens.isEmpty()) {
    const clazz = parseClass(tokens)
    if (clazz === null) break
    ast.push(clazz)
  }

  return ast
}
