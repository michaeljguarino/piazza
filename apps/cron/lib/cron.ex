defmodule Cron do
  @moduledoc """
  Documentation for Cron.
  """
  defmacro __using__(_) do
    quote do
      require Logger
    end
  end
end
