export function updateUser(prev, user) {
  const edges = prev.users.edges.map((e) => (e.node.id === user.id) ? {...e, node: user} : e)
  return {...prev, edges: edges}
}