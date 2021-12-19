const tokenize = (input: string, lineComment = "//"): Array<string> => {
  return input.split(/\r?\n/).flatMap((line) => {
    if (line.trim().startsWith(lineComment)) return []
    return line
      .trim()
      .split(" ")
      .map((it) => it.trim())
      .filter((line) => line.length > 0)
  })
}

export class Tokens {
  private tokens: Array<string>
  protected previous: Array<string>
  private readonly startBlockComment: string
  private readonly endBlockComment: string

  constructor(input: string | Array<string>, lineComment = "//", startComment = "/*", endComment = "*/") {
    this.tokens = typeof input === "string" ? tokenize(input, lineComment) : input
    this.previous = []
    this.startBlockComment = startComment
    this.endBlockComment = endComment
  }

  peek = (): string => {
    return this.tokens[0]
  }

  peekN = (i = 1): Array<string> => {
    return this.tokens.slice(0, i)
  }

  read = (): string => {
    this.skipBlockComments()
    const token = this.tokens[0]
    this.skip(1)
    return token
  }

  readTo = (it: string): string => {
    this.skipBlockComments()
    while (!this.isEmpty() && this.peek() !== it) {
      this.skip()
    }
    return this.read()
  }

  skip = (i = 1) => {
    this.tokens = this.tokens.slice(i)
  }

  isEmpty = (): boolean => {
    return this.tokens.length === 0
  }

  preserve = () => {
    this.previous = [...this.tokens]
  }

  restore = () => {
    this.tokens = this.previous
    this.previous = []
  }

  private skipBlockComments = () => {
    if (this.peek().startsWith(this.startBlockComment)) this.readTo(this.endBlockComment)
  }
}
