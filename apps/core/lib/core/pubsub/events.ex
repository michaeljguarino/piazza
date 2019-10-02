defmodule Core.PubSub.UserCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.UserUpdated, do: use Piazza.PubSub.Event

defmodule Core.PubSub.ConversationCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.ConversationUpdated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.ConversationDeleted, do: use Piazza.PubSub.Event

defmodule Core.PubSub.MessageCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.MessageDeleted, do: use Piazza.PubSub.Event
defmodule Core.PubSub.MessageUpdated, do: use Piazza.PubSub.Event

defmodule Core.PubSub.MessageFanout do
  defstruct [:item, :actor, :user, :delta, :source_pid]
end

defmodule Core.PubSub.ParticipantCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.ParticipantUpdated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.ParticipantDeleted, do: use Piazza.PubSub.Event

defmodule Core.PubSub.CommandCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.CommandUpdated, do: use Piazza.PubSub.Event

defmodule Core.PubSub.NotificationCreated, do: use Piazza.PubSub.Event

defmodule Core.PubSub.PinnedMessageCreated, do: use Piazza.PubSub.Event
defmodule Core.PubSub.PinnedMessageDeleted, do: use Piazza.PubSub.Event

defmodule Core.PubSub.EmojiCreated, do: use Piazza.PubSub.Event
