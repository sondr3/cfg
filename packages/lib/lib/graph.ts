// eslint-disable-next-line import/named
import { ArrowHeadType, Elements, FlowElement, Position } from "react-flow-renderer"

import { Cfg, CfgFor, CfgIf, CfgObject, CfgWhile } from "./cfg"

const defaultEdge: Partial<FlowElement> = {
  arrowHeadType: ArrowHeadType.ArrowClosed,
  type: "smart",
}

const defaultNode: Partial<FlowElement> = {
  sourcePosition: Position.Left,
  targetPosition: Position.Right,
}

export const buildGraph = (cfg: Cfg): Elements => {
  if (cfg.kind !== "root") throw new Error("Root CFG is not a `root` kind")
  const elements: Elements = []

  elements.push({
    id: "root",
    data: { label: "root" },
    position: { x: 0, y: 0 },
    type: "input",
    isHidden: true,
    ...defaultNode,
  })
  buildBody(elements, cfg.body, cfg.name)

  return elements
}

const buildBody = (elements: Elements, body: Array<Cfg>, parent: string) => {
  for (const child of body) {
    switch (child.kind) {
      case "object":
        buildObject(elements, child, parent)
        break
      case "if":
        buildIf(elements, child, parent)
        break
      case "for":
        buildFor(elements, child, parent)
        break
      case "while":
        buildWhile(elements, child, parent)
        break
      default:
        throw new Error("Multiple roots found")
    }
  }
}

const buildObject = (elements: Elements, cfg: CfgObject, parent: string) => {
  elements.push({
    id: cfg.name,
    data: { label: cfg.name },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })
  elements.push({ id: `${parent}-${cfg.name}`, source: parent, target: cfg.name, ...defaultEdge })
  buildBody(elements, cfg.body, cfg.name)
}

const buildIf = (elements: Elements, cfg: CfgIf, parent: string) => {
  elements.push({
    id: cfg.name,
    data: { label: cfg.name },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })

  elements.push({ id: `${cfg.name}-cond`, data: { label: "cond" }, position: { x: 0, y: 0 }, ...defaultNode })
  elements.push({ id: `${cfg.name}-then`, data: { label: "then" }, position: { x: 0, y: 0 }, ...defaultNode })
  elements.push({
    id: `${cfg.name}-end`,
    data: { label: `end${cfg.name}` },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })

  elements.push({ id: `${parent}-${cfg.name}`, source: parent, target: cfg.name, ...defaultEdge })

  elements.push({ id: `${cfg.name}-cond`, source: cfg.name, target: `${cfg.name}-cond`, ...defaultEdge })
  elements.push({ id: `${cfg.name}-cond-then`, source: `${cfg.name}-cond`, target: `${cfg.name}-then`, ...defaultEdge })
  elements.push({ id: `${cfg.name}-S`, data: { label: "S" }, position: { x: 0, y: 0 }, ...defaultNode })

  buildBody(elements, cfg.body, `${cfg.name}-S`)

  if (cfg.else) {
    elements.push({ id: `${cfg.name}-else`, data: { label: "else" }, position: { x: 0, y: 0 }, ...defaultNode })
    elements.push({ id: `${cfg.name}-T`, data: { label: "T" }, position: { x: 0, y: 0 }, ...defaultNode })
    elements.push({
      id: `${cfg.name}-cond-else`,
      source: `${cfg.name}-cond`,
      target: `${cfg.name}-else`,
      ...defaultEdge,
    })
    elements.push({ id: `${cfg.name}-else-t`, source: `${cfg.name}-else`, target: `${cfg.name}-T`, ...defaultEdge })
    elements.push({
      id: `${cfg.name}-T-end-${cfg.name}`,
      source: `${cfg.name}-T`,
      target: `${cfg.name}-end`,
      ...defaultEdge,
    })

    buildBody(elements, cfg.elseBody, `${cfg.name}-T`)
  }

  elements.push({ id: `${cfg.name}-then-S`, source: `${cfg.name}-then`, target: `${cfg.name}-S`, ...defaultEdge })
  elements.push({ id: `${cfg.name}-S-endif`, source: `${cfg.name}-S`, target: `${cfg.name}-end`, ...defaultEdge })
}

const buildFor = (elements: Elements, cfg: CfgFor, parent: string) => {
  elements.push({
    id: cfg.name,
    data: { label: cfg.name },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })
  elements.push({ id: `${parent}-${cfg.name}`, source: parent, target: cfg.name, ...defaultEdge })
  elements.push({ id: `${cfg.name}-T`, data: { label: "T" }, position: { x: 0, y: 0 }, ...defaultNode })
  elements.push({ id: `${cfg.name}-e-T`, source: cfg.name, target: `${cfg.name}-T`, ...defaultEdge })
  elements.push({
    id: `${cfg.name}-end`,
    data: { label: `end${cfg.name}` },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })
  elements.push({ id: `${cfg.name}-end`, source: `${cfg.name}-T`, target: `${cfg.name}-end`, ...defaultEdge })
  elements.push({ id: `${cfg.name}-end-start`, source: `${cfg.name}-end`, target: cfg.name, ...defaultEdge })

  buildBody(elements, cfg.body, cfg.name)
}

const buildWhile = (elements: Elements, cfg: CfgWhile, parent: string) => {
  elements.push({
    id: cfg.name,
    data: { label: cfg.name },
    position: { x: 0, y: 0 },
    ...defaultNode,
  })
  elements.push({ id: `${parent}-${cfg.name}`, source: parent, target: cfg.name, ...defaultEdge })

  elements.push({ id: `${cfg.name}-T`, data: { label: "T" }, position: { x: 0, y: 0 }, ...defaultNode })
  elements.push({ id: `${cfg.name}-e-T`, source: cfg.name, target: `${cfg.name}-T`, ...defaultEdge })

  elements.push({ id: `${cfg.name}-T-start`, source: `${cfg.name}-T`, target: cfg.name, ...defaultEdge })

  elements.push({ id: `${cfg.name}-end`, data: { label: `end${cfg.name}` }, position: { x: 0, y: 0 }, ...defaultNode })
  elements.push({ id: `${cfg.name}-end`, source: `${cfg.name}-T`, target: `${cfg.name}-end`, ...defaultEdge })

  buildBody(elements, cfg.body, cfg.name)
}
