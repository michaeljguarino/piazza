import { Node } from 'slate'

export const plainSerialize = nodes => {
  return nodes.map(n => Node.string(n)).join('\n')
}

export const plainDeserialize = text => {
  return text.split('\n').map(line => ({children: [{ text: line }]}))
}