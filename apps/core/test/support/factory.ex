defmodule Core.Factory do
  use ExMachina.Ecto, repo: Core.Repo

  alias Core.Models

  def user_factory() do
    %Models.User{
      name: "Some User",
      email: sequence(:email, &"email-#{&1}@example.com"),
      handle: sequence(:handle, &"handle-#{&1}")
    }
  end

  def conversation_factory() do
    %Models.Conversation{
      name: sequence(:conversation, &"conversation-#{&1}")
    }
  end

  def message_factory() do
    %Models.Message{
      text: "Some message",
      conversation: build(:conversation),
      creator: build(:user)
    }
  end

  def participant_factory() do
    %Models.Participant{
      conversation: build(:conversation),
      user: build(:user)
    }
  end

  def webhook_factory() do
    %Models.Webhook{
      url: "https://example.com/webhook"
    }
  end

  def command_factory() do
    %Models.Command{
      name: sequence(:command, &"command-#{&1}"),
      webhook: build(:webhook),
      bot: build(:user, bot: true),
      creator: build(:user)
    }
  end

  def message_entity_factory do
    %Models.MessageEntity{
      type: :mention,
      message: build(:message),
      user: build(:user),
      start_index: 0,
      length: 1
    }
  end

  def message_reaction_factory do
    %Models.MessageReaction{
      name: "emoji",
      message: build(:message),
      user: build(:user)
    }
  end

  def notification_factory do
    %Models.Notification{
      type: :mention,
      user: build(:user),
      message: build(:message),
      actor: build(:user)
    }
  end

  def pinned_message_factory do
    %Models.PinnedMessage{
      message: build(:message),
      conversation: build(:conversation),
      user: build(:user)
    }
  end
end