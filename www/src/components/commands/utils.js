import sortBy from 'lodash/sortBy'

export function addCommand(prev, command) {
  const commands = prev.commands
  if (commands.edges.find((e) => e.node.id === command.id))
    return updateCommand(prev, command)

  return {
    ...prev,
    commands: {
      ...commands,
      edges: sortBy([{__typename: 'CommandEdge', node: command}, ...commands.edges], (e) => e.node.name)
    }
  }
}

export function updateCommand(prev, command) {
  return {
    ...prev,
    commands: {
      ...prev.commands,
      edges: prev.commands.edges.map((e) => {
        if (e.node.id === command.id) return {...e, node: command}
        return e
      })
    }
  }
}