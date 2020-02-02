defmodule Core.PubSub.Consumers.Email.UsersTest do
  use Core.DataCase, async: true
  use Bamboo.Test

  alias Core.PubSub.Consumers
  alias Core.PubSub

  describe "PasswordReset" do
    test "It will send a password reset email" do
      reset_token = insert(:reset_token)

      event = %PubSub.PasswordReset{item: reset_token}
      Consumers.Email.handle_event(event)

      assert_delivered_email Email.Builder.reset_password(reset_token)
    end
  end
end