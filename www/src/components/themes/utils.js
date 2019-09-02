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