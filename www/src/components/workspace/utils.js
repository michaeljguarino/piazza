import { WORKSPACE_Q } from "./queries"

export function addTheme(prev, theme) {
  if (prev.themes.edges.find((e) => e.node.name === theme.name))
    return updateTheme(prev, theme)

  return {
    ...prev,
    themes: {
      ...prev.themes,
      edges: [{__typename: "ThemeEdge", node: theme}, ...prev.themes.edges]
    }
  }
}

export function updateTheme(prev, theme) {
  return {
    ...prev,
    themes: {
      ...prev.themes,
      edges: prev.themes.edges.map((e) => e.node.id === theme.id ? {...e, node: theme} : e)
    }
  }
}

export function addWorkspace(cache, workspace) {
  const {workspaces, ...prev} = cache.readQuery({query: WORKSPACE_Q})
  if (workspaces.edges.find(({node: {id}}) => id  === workspace.id)) return

  cache.writeQuery({
    query: WORKSPACE_Q,
    data: {...prev, workspaces: {
      ...workspaces,
      edges: [{__typename: "WorkspaceEdge", node: workspace}, ...workspaces.edges]
    }}
  })
}

export function updateNotifications(cache, filter, update) {
  const {workspaces, ...prev} = cache.readQuery({query: WORKSPACE_Q})
  const edges = workspaces.edges.map((edge) => filter(edge) ? update(edge) : edge)
  cache.writeQuery({query: WORKSPACE_Q, data: {...prev, workspaces: {...workspaces, edges}}})
}