import React from 'react'
import { Box, Text } from 'grommet'
import { Resources } from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, { FlyoutHeader, FlyoutContainer } from '../utils/Flyout'
import { HeaderIcon } from './ConversationHeader'
import { FileEntry } from '../messages/File'
import { Loader } from './utils'
import { mergeAppend } from '../../utils/array'
import { FILES_Q } from './queries'
import { useQuery } from 'react-apollo'
import Loading from '../utils/Loading'

const doFetchMore = (prev, {fetchMoreResult}) => {
  const {edges, pageInfo} = fetchMoreResult.conversation.files
  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      files: {
        ...prev.conversation.files,
        pageInfo,
        edges: mergeAppend(edges, prev.conversation.files.edges, ({node: {id}}) => id)
      }
    }
  }
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

function Content({conversationId, setOpen}) {
  const {data, fetchMore} = useQuery(FILES_Q, {variables: {conversationId}})

  if (!data) return <Loading width='40vw' />

  const {edges, pageInfo} = data.conversation.files

  return (
    <FlyoutContainer width='40vw'>
      <FlyoutHeader text='Files' setOpen={setOpen} />
      <Box
        pad={{bottom: 'small'}}
        margin={{bottom: 'small'}}>
        <Scroller
          id='files'
          style={{overflow: 'auto', maxHeight: '100%'}}
          edges={edges}
          emptyState={<NoFiles />}
          mapper={({node}, next) => (<FileEntry key={node.id} file={node} next={next} />)}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
              variables: {conversationId, cursor: pageInfo.endCursor},
              updateQuery: doFetchMore
            })
          } />
      </Box>
    </FlyoutContainer>
  )
}

export default function Files({data, conversationId}) {
  console.log(data)
  if (!data) return <Loader />
  const {conversation} = data

  return (
    <Flyout width='30vw' target={<HeaderIcon icon={Resources} count={conversation.fileCount} />}>
    {setOpen => <Content conversationId={conversationId} setOpen={setOpen} />}
    </Flyout>
  )
}