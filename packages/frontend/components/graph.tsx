import ReactFlow, { Elements } from "react-flow-renderer"
import { SmartEdge } from "@tisoap/react-flow-smart-edge"

const onLoad = (instance: { fitView: () => void }) => instance.fitView()

interface Props {
  elements: Elements
}

export const Graph = ({ elements }: Props): JSX.Element => {
  return (
    <ReactFlow
      elements={elements}
      snapToGrid={true}
      snapGrid={[15, 15]}
      onLoad={onLoad}
      edgeTypes={{
        smart: SmartEdge,
      }}
      // selectNodesOnDrag={false}
      // nodesDraggable={false}
    />
  )
}
