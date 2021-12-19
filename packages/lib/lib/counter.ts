import { Ast } from "./parsers"

interface Counts {
  for: number
  while: number
  if: number
}

export class Counter {
  private counts: Counts = {
    for: 0,
    while: 0,
    if: 0,
  }

  name = (ast: Ast): string => {
    switch (ast.kind) {
      case "for":
      case "if":
      case "while":
        return this.genName(ast.kind)
      case "object":
        return ast.name
    }
  }

  private genName = (kind: keyof Counts): string => {
    const name = this.counts[kind] === 0 ? kind : `${kind}${this.counts.for}`
    this.counts[kind] += 1
    return name
  }
}
