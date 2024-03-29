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
      name: sequence(:conversation, &"conversation-#{&1}"),
      workspace: build(:workspace)
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

  def incoming_webhook_factory do
    %Models.IncomingWebhook{
      name: sequence(:incoming_webhook, &"incoming-webhook-#{&1}"),
      secure_id: sequence(:incoming_webhook, &"secure-id-#{&1}"),
      conversation: build(:conversation),
      bot: build(:user, bot: true),
      command: build(:command),
      creator: build(:user)
    }
  end

  def unfurler_factory do
    %Models.Unfurler{
      command: build(:command),
      regex: ".*"
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

  def invite_factory do
    %Models.Invite{
      type: :conversation,
      creator: build(:user),
      external_id: sequence(:invite, & "external-id-#{&1}")
    }
  end

  def webhook_route_factory do
    %Models.WebhookRoute{
      route_key: sequence(:route_key, & "route-key-#{&1}"),
      conversation: build(:conversation),
      incoming_webhook: build(:incoming_webhook)
    }
  end

  def emoji_factory do
    %Models.Emoji{
      name: sequence(:emoji, & "emoji-#{&1}"),
      creator: build(:user)
    }
  end

  def brand_factory do
    %Models.Brand{
      theme: build(:theme)
    }
  end

  def theme_factory do
    %Models.Theme{
      name: sequence(:theme, & "theme-#{&1}"),
      creator: build(:user)
    }
  end

  def user_theme_factory do
    %Models.UserTheme{
      user: build(:user),
      theme: build(:theme)
    }
  end

  def installable_command_factory do
    %Models.InstallableCommand{
      name: sequence(:installable_command, & "installable-#{&1}"),
      description: "some command",
      documentation: "write your docs",
      avatar: "https://example.com",
      webhook: "https://example.com/webhook"
    }
  end

  def interaction_factory do
    %Models.Interaction{
      command: build(:command),
      message: build(:message)
    }
  end

  def file_factory do
    %Models.File{
      message: build(:message),
      filename: "filename.jpg",
      media_type: :image
    }
  end

  def reset_token_factory do
    %Models.ResetToken{
      secure_id: sequence(:reset_tokens, & "some-id-#{&1}"),
      type: :password,
      user: build(:user)
    }
  end

  def workspace_factory do
    %Models.Workspace{
      name: sequence(:workspace, & "workspace-#{&1}")
    }
  end
end