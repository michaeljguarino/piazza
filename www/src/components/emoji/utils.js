export function toEmojiPicker({name, imageUrl}) {
  return {
    name,
    imageUrl,
    short_names: [name],
    keywords: [name],
    text: '',
    emoticons: []
  }
}

export function addEmoji(prev, emoji) {
  if (prev.edges.find((e) => e.node.name === emoji.name))
    return updateEmoji(prev, emoji)

  const newEmoji = {__typename: 'EmojiEdge', node: emoji}
  return {
    ...prev,
    edges: {
      ...prev.edges,
      edges: [newEmoji, ...prev.edges]
    }
  }
}

export function updateEmoji(prev, emoji) {
  return {
    ...prev,
    edges: {
      ...prev.edges,
      edges: prev.edges.map((e) => e.node.name === emoji.name ? {...e, node: emoji} : e)
    }
  }
}