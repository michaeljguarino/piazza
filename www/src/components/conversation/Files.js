import React from 'react'
import {useQuery} from 'react-apollo'
import {Box, Text} from 'grommet'
import {Document} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader, FlyoutContainer} from '../utils/Flyout'
import {FILES_Q} from './queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import HoveredBackground from '../utils/HoveredBackground'
import {FileEntry} from '../messages/File'
import {Loader} from './utils'

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

function Files(props) {
  const {loading, data, fetchMore} = useQuery(FILES_Q, {
    variables: {conversationId: props.conversation.id}
  })
  if (loading) return <Loader />
  let pageInfo = data.conversation.files.pageInfo
  let edges = data.conversation.files.edges

  return (
    <Flyout width='30vw' target={
      <HoveredBackground>
        <Box {...BOX_ATTRS} accentable>
          <Text height='12px' style={{lineHeight: '12px'}} margin={{right: '3px'}}>
            <Document size='12px' />
          </Text>
          <Text size='xsmall'>{data.conversation.fileCount}</Text>
        </Box>
      </HoveredBackground>
    }>
    {setOpen => (
      <FlyoutContainer width='40vw'>
        <FlyoutHeader text='Files' setOpen={setOpen} />
        <Box
          pad={{bottom: 'small'}}
          margin={{bottom: 'small'}}>
          <Scroller
            style={{
              overflow: 'auto',
              maxHeight: '70%',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'column'
            }}
            edges={edges}
            emptyState={<NoFiles />}
            mapper={({node}, next) => (<FileEntry key={node.id} file={node} next={next} />)}
            onLoadMore={() => {
              if (!pageInfo.hasNextPage) return
              fetchMore({
                variables: {cursor: pageInfo.endCursor},
                updateQuery: doFetchMore
              })
            }} />
        </Box>
      </FlyoutContainer>
    )}
    </Flyout>
  )
}

export default Files