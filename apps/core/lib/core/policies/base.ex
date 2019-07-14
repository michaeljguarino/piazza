defmodule Core.Policies.Base do
  @moduledoc """
  Simple composable policy, each policy should be of the form:

  ```
  can?(user, resource, action) -> :continue, {:error, "reason"}, :pass
  ```

  Policies can then be composed like:
  ```
  import Core.Policy.SomeModel
  ...
  allow(resource, user, [action]) -> {:ok, resource} | {:error, error}
  ```
  """
  defmacro __using__(_) do
    quote do
      import Core.Policies.Base

      def allow(resource, user, action) when is_atom(action),
        do: allow(resource, user, [action])
      def allow(resource, user, actions) do
        with {:ok, record} <- find_resource(resource),
             :ok <- resolve_policy(__MODULE__, record, user, actions),
          do: {:ok, resource}
      end
    end
  end

  # TODO: parallelize policy resolutions
  def resolve_policy(_, _, _, []), do: :ok
  def resolve_policy(policy_module, resource, user, [next | actions]) do
    {resource, action} = infer_resource_and_action(next, resource)
    case policy_module.can?(user, resource, action) do
      :continue -> resolve_policy(policy_module, resource, user, actions)
      {:error, reason} -> {:error, reason}
      :pass -> :ok
    end
  end

  def find_resource(%Ecto.Changeset{valid?: true} = cs), do: {:ok, Ecto.Changeset.apply_changes(cs)}
  def find_resource(%Ecto.Changeset{} = cs), do: {:error, cs}
  def find_resource(resource), do: {:ok, resource}

  defp infer_resource_and_action({resource, action}, _), do: {resource, action}
  defp infer_resource_and_action(action, resource), do: {resource, action}
end