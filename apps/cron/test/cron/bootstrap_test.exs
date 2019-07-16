defmodule Cron.BootstrapTest do
  use Core.DataCase
  alias Core.Models.{Conversation, User}

  describe "#run/0" do
    test "creates an admin user and townhall conversation" do
      :ok = Cron.Bootstrap.run()

      admin = Core.Repo.get_by(User, email: "admin@example.com")
      assert admin

      conversation =  Core.Repo.get_by(Conversation, name: "townhall")
      assert conversation.global
      assert conversation.public
      assert conversation.creator_id == admin.id
    end
  end
end