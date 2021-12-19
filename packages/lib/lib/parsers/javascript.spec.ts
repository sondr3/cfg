import { Ast, AstFor, AstIf, AstObject, isFor, isIf, isObject, parse } from "."
import { parseClass, parseFor, parseFunction, parseIf, parseWhile } from "./javascript"
import { Tokens } from "./tokens"

describe("JavaScript classes", () => {
  const testClass = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseClass(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testClass("parses simple", "class JavaScript {\n}", {
    kind: "object",
    name: "JavaScript",
    type: "class",
    body: [],
  })

  testClass(
    "parses with constructor and method",
    `class Test {
  #field = 0
  constructor() { }
  set field(input) { }
}`,
    {
      kind: "object",
      name: "Test",
      type: "class",
      body: [
        {
          kind: "object",
          name: "constructor",
          type: "method",
          body: [],
        },
        {
          kind: "object",
          name: "field",
          type: "method",
          body: [],
        },
      ],
    },
  )
})

describe("JavaScript functions", () => {
  const testFun = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseFunction(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  describe("simple", () => {
    testFun("function", `function helloWorld(name) {\n}`, {
      kind: "object",
      type: "function",
      name: "helloWorld",
      body: [],
    })

    testFun("const function", `const helloWorld = (name) => {\n}`, {
      kind: "object",
      type: "function",
      name: "helloWorld",
      body: [],
    })
  })
})

describe("JavaScript if", () => {
  const testIf = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      const res = parseIf(tokens)
      expect(res).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testIf("simple", "if    (true) {\n}", {
    kind: "if",
    else: false,
    name: "if",
    ifBody: [],
    elseBody: [],
  })

  testIf("simple with else", "    if (true) {\n} else {\n}", {
    kind: "if",
    else: true,
    name: "if",
    ifBody: [],
    elseBody: [],
  })
})

describe("JavaScript for", () => {
  const testFor = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseFor(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testFor("simple", "for (i = 0; i > 10; i++) { \n }", {
    kind: "for",
    name: "for",
    body: [],
  })

  testFor("other for", "  for (string it : collection) { \n }", {
    kind: "for",
    name: "for",
    body: [],
  })
})

describe("JavaScript while", () => {
  const testWhile = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseWhile(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testWhile("simple", "while (true) { \n }", {
    kind: "while",
    name: "while",
    body: [],
  })
})

describe("examples", () => {
  it("parse", () => {
    const body = `class JavaScript {
  constructor(name) {
    for (let i = 0; i > 10; i++) { }
  }
  get field() { }
  set field() {
    if (true) {
    }
   }
 }`

    const parsed = parse("javascript", body)
    const clazz = parsed[0] as AstObject
    const conztructor = clazz.body[0] as AstObject
    const _for = conztructor.body[0] as AstFor

    expect(isFor(_for)).toBeTruthy()
    expect(_for.kind).toBe("for")

    const _get = clazz.body[1] as AstObject
    expect(isObject(_get)).toBeTruthy()

    const _set = clazz.body[2] as AstObject
    expect(isObject(_set)).toBeTruthy()

    const _if = _set.body[0] as AstIf
    expect(isIf(_if)).toBeTruthy()
    expect(_if.name).toBe("if")
  })
})
