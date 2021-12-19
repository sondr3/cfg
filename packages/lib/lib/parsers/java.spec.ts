import { Ast, AstFor, AstIf, AstObject, parse } from "."
import { parseCall, parseClass, parseFor, parseIf, parseMethod, parseWhile } from "./java"
import { Tokens } from "./tokens"

describe("Java classes", () => {
  const testClass = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseClass(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testClass("parses simple", "class Main {\n}", {
    kind: "object",
    name: "Main",
    type: "class",
    body: [],
  })

  describe("parses with visibility", () => {
    testClass("private", "private class Something {\n}", {
      kind: "object",
      name: "Something",
      type: "class",
      body: [],
    })
    testClass("public", "public class Haskell {\n}", {
      kind: "object",
      name: "Haskell",
      type: "class",
      body: [],
    })
  })

  testClass(
    "subclasses",
    `class Main
  {
     public class Other { }
  }`,
    {
      kind: "object",
      name: "Main",
      type: "class",
      body: [
        {
          kind: "object",
          name: "Other",
          type: "class",
          body: [],
        },
      ],
    },
  )

  testClass(
    "subclass and methods",
    `class Main
  {
     public string toString() { }
     public class Other {
        //
     }
  }`,
    {
      kind: "object",
      name: "Main",
      type: "class",
      body: [
        {
          kind: "object",
          name: "toString",
          type: "method",
          body: [],
        },
        {
          kind: "object",
          name: "Other",
          type: "class",
          body: [],
        },
      ],
    },
  )
})

describe("Java methods", () => {
  const testMethod = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      const res = parseMethod(tokens)
      expect(res).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testMethod("simple", "void delete() {\n}", { kind: "object", name: "delete", type: "method", body: [] })
  describe("types", () => {
    testMethod("generic", "List<T> append(List<T> item) {\n}", {
      kind: "object",
      name: "append",
      type: "method",
      body: [],
    })

    testMethod("visible generic", "public List<T> remove(T item) {\n}", {
      kind: "object",
      name: "remove",
      type: "method",
      body: [],
    })
  })
})

describe("Java if", () => {
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

describe("Java for", () => {
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

describe("Java while", () => {
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

describe("Java functions/method calls", () => {
  const testCall = (name: string, input: string, expected: Ast) => {
    it(`${name}`, () => {
      const tokens = new Tokens(input)
      expect(parseCall(tokens)).toStrictEqual(expected)
      expect(tokens.isEmpty()).toBeTruthy()
    })
  }

  testCall("simple", "this.toString();", {
    kind: "object",
    type: "call",
    name: "toString",
    body: [],
  })

  testCall("assignment", "String output = new StringBuilder();", {
    kind: "object",
    type: "call",
    name: "StringBuilder",
    body: [],
  })
})

describe("examples", () => {
  it("parses", () => {
    const body = `class Test {
  private void main() {
    if (4 > 2) {
}
  for (int i : arr) { 
  }
 }
}`
    const parsed = parse("java", body)

    const main = parsed[0] as AstObject
    const method = main.body[0] as AstObject
    const _if = method.body[0] as AstIf
    const _for = method.body[1] as AstFor

    expect(main.kind).toBe("object")
    expect(main.name).toBe("Test")

    expect(method.name).toBe("main")
    expect(_if.else).toBeFalsy()
    expect(_if.name).toBe("if")

    expect(_for.name).toBe("for")
  })

  it("parses multiple classes", () => {
    const body = `class TheFirst {
  private void main() { }
}

protected class TheOther {
}`
    const parsed = parse("java", body)

    const main = parsed[0] as AstObject
    const method = main.body[0] as AstObject

    expect(main.kind).toBe("object")
    expect(main.name).toBe("TheFirst")

    expect(method.kind).toBe("object")
    expect(method.type).toBe("method")
    expect(method.name).toBe("main")

    const other = parsed[1] as AstObject

    expect(other.kind).toBe("object")
    expect(other.type).toBe("class")
    expect(other.name).toBe("TheOther")
  })

  it("parses nested ASTs", () => {
    const body = `class Work {
  private void loop() {
    if (4 > 2) {
      for (int i : arr) { 
      }
    }
  }
}`
    const parsed = parse("java", body)

    const main = parsed[0] as AstObject
    const method = main.body[0] as AstObject
    const _if = method.body[0] as AstIf

    expect(main.kind).toBe("object")
    expect(main.name).toBe("Work")

    expect(method.name).toBe("loop")
    expect(_if.else).toBeFalsy()
    expect(_if.name).toBe("if")

    expect(_if.ifBody[0].name).toBe("for")
  })
})
