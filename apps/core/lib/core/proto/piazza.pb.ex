defmodule Core.PingConversationRequest do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          user_id: String.t(),
          conversation_id: String.t()
        }
  defstruct [:user_id, :conversation_id]

  field :user_id, 1, type: :string
  field :conversation_id, 2, type: :string
end

defmodule Core.LeaveConversationRequest do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          user_id: String.t(),
          conversation_id: String.t()
        }
  defstruct [:user_id, :conversation_id]

  field :user_id, 1, type: :string
  field :conversation_id, 2, type: :string
end

defmodule Core.PingResponse do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          fulfilled: boolean
        }
  defstruct [:fulfilled]

  field :fulfilled, 1, type: :bool
end

defmodule Core.ActiveUser do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          user_id: String.t()
        }
  defstruct [:user_id]

  field :user_id, 1, type: :string
end

defmodule Core.ActiveUsers do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          active_users: [Core.ActiveUser.t()]
        }
  defstruct [:active_users]

  field :active_users, 1, repeated: true, type: Core.ActiveUser
end

defmodule Core.ActiveUsersRequest do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          scope: String.t()
        }
  defstruct [:scope]

  field :scope, 1, type: :string
end

defmodule Core.Piazza.Service do
  @moduledoc false
  use GRPC.Service, name: "core.Piazza"

  rpc :PingConversation, Core.PingConversationRequest, Core.PingResponse
  rpc :LeaveConversation, Core.LeaveConversationRequest, Core.PingResponse
end

defmodule Core.Piazza.Stub do
  @moduledoc false
  use GRPC.Stub, service: Core.Piazza.Service
end

defmodule Core.PiazzaRtc.Service do
  @moduledoc false
  use GRPC.Service, name: "core.PiazzaRtc"

  rpc :ListActive, Core.ActiveUsersRequest, Core.ActiveUsers
end

defmodule Core.PiazzaRtc.Stub do
  @moduledoc false
  use GRPC.Stub, service: Core.PiazzaRtc.Service
end
