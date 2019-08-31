import sortBy from 'lodash/sortBy'

export function updateUser(prev, user) {
  const edges = prev.users.edges.map((e) => (e.node.id === user.id) ? {...e, node: user} : e)
  return {...prev, edges: edges}
}

export function addUser(prev, user) {
  if (prev.users.edges.find((e) => e.node.id === user.id))
    return updateUser(prev, user)

  const edges = prev.users.edges

  return {
    ...prev,
    users: {
      ...prev.users,
      edges: sortBy([{__typename: "UserEdge", node: user}, ...edges], (e) => e.node.handle)
    }
  }
}