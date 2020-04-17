import React from 'react'
import { Box, Text } from 'grommet'
import { Resources } from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, { FlyoutHeader, FlyoutContainer } from '../utils/Flyout'
import { mergeAppend } from '../../utils/array'
import { HeaderIcon } from './ConversationHeader'
import { FileEntry } from '../messages/File'
import { Loader } from './utils'

const doFetchMore = (prev, {fetchMoreResult}) => {
  const edges = fetchMoreResult.conversation.files.edges
  const pageInfo = fetchMoreResult.conversation.files.pageInfo

  return edges.length ? {
    ...prev,
    conversation: {
      ...prev.conversation,
      files: {
        ...prev.conversation.files,
        pageInfo,
        edges: mergeAppend(edges, prev.conversation.files.edges, (e) => e.node.id)
      }
    }
  } : prev;
}

const NoFiles = () => {
  return (
    <Box pad='small'>
      <Text size='small'>
        <i>If you attach files to any message in this conversation, they will be collected here</i>
      </Text>
    </Box>
  )
}

export default function Files({loading, data, fetchMore}) {
  if (loading) return <Loader />
  const {files: {edges, pageInfo}, fileCount} = data.conversation

  return (
    <Flyout width='30vw' target={<HeaderIcon icon={Resources} count={fileCount} />}>
    {setOpen => (
      <FlyoutContainer width='40vw'>
        <FlyoutHeader text='Files' setOpen={setOpen} />
        <Box
          pad={{bottom: 'small'}}
          margin={{bottom: 'small'}}>
          <Scroller
            id='files'
            style={{
              overflow: 'auto',
              maxHeight: '100%'
            }}
            edges={edges}
            emptyState={<NoFiles />}
            mapper={({node}, next) => (<FileEntry key={node.id} file={node} next={next} />)}
            onLoadMore={() => {
              pageInfo.hasNextPage && fetchMore({
                variables: {fileCursor: pageInfo.endCursor},
                updateQuery: doFetchMore
              })
            }} />
        </Box>
      </FlyoutContainer>
    )}
    </Flyout>
  )
}