defmodule Core.PubSub.Event do
  defmacro __using__(_) do
    quote do
      defstruct [:item, :actor, :context, :source_pid]
    end
  end
end

defmodule Core.PubSub.UserCreated, do: use Core.PubSub.Event

defmodule Core.PubSub.UserUpdated, do: use Core.PubSub.Event

defmodule Core.PubSub.ConversationCreated, do: use Core.PubSub.Event

defmodule Core.PubSub.ConversationUpdated, do: use Core.PubSub.Event

defmodule Core.PubSub.ConversationDeleted, do: use Core.PubSub.Event

defmodule Core.PubSub.MessageCreated, do: use Core.PubSub.Event

defmodule Core.PubSub.MessageDeleted, do: use Core.PubSub.Event

defmodule Core.PubSub.MessageUpdated, do: use Core.PubSub.Event

defmodule Core.PubSub.ParticipantCreated, do: use Core.PubSub.Event

defmodule Core.PubSub.ParticipantUpdated, do: use Core.PubSub.Event

defmodule Core.PubSub.ParticipantDeleted, do: use Core.PubSub.Event

defmodule Core.PubSub.CommandCreated, do: use Core.PubSub.Event

defmodule Core.PubSub.CommandUpdated, do: use Core.PubSub.Event

defmodule Core.PubSub.NotificationCreated, do: use Core.PubSub.Event
