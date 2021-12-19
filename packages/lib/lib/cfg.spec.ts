import { CfgObject, constructCFG } from "./cfg"
import { parse } from "./parsers"

describe("Basic CFG", () => {
  it("works", () => {
    const ast = parse(
      "java",
      `class Main {
  void print() {
    if (true) { }
  }
  public string destroy() {
  }
}`,
    )
    const cfg = constructCFG(ast)
    const main = cfg.body[0] as CfgObject

    expect(cfg.kind).toBe("root")

    expect(main.kind).toBe("object")
    expect(main.type).toBe("class")
    expect(main.name).toBe("Main")

    const body = main.body

    expect(body).toHaveLength(2)
    expect(body[0].kind).toBe("object")
    expect(body[1].kind).toBe("object")

    expect((body[0] as CfgObject).name).toBe("print")
    expect((body[1] as CfgObject).name).toBe("destroy")
  })
})
