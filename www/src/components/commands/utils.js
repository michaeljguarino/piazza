import sortBy from 'lodash/sortBy'

export function addCommand(prev, command) {
  const commands = prev.commands
  if (commands.edges.find((e) => e.node.id === command.id))
    return prev

  return {
    ...prev,
    commands: {
      ...commands,
      edges: sortBy([{__typename: 'CommandEdge', node: command}, ...commands.edges], (e) => e.node.name)
    }
  }
}