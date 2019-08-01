defmodule Core.Commands.Base do
  defmacro __using__(_) do
    quote do
      import Core.Commands.Base
      Module.register_attribute(__MODULE__, :commands, accumulate: :true)
      Module.register_attribute(__MODULE__, :args, accumulate: true)
      Module.register_attribute(__MODULE__, :docs, accumulate: true)
      Module.register_attribute(__MODULE__, :handlers, accumulate: true)

      @before_compile Core.Commands.Base
    end
  end

  defmacro __before_compile__(_) do
    quote do
      def documentation() do
        @commands
        |> Enum.map(fn command ->
          formatted_args = Enum.map(@args[command], &"_#{&1}_")
          "* /#{@base_command} *#{command}* #{Enum.join(formatted_args, " ")} - #{@docs[command]}"
        end)
        |> Enum.join("\n")
      end

      @dispatch_table Enum.into(@handlers, %{}, fn {k, v} -> {Atom.to_string(k), v} end)
      def dispatch(msg, subcommand, args) do
        case @dispatch_table[subcommand] do
          command when is_atom(command) -> apply(__MODULE__, command, [msg | args])
          _ -> {:ok, "unrecognized command #{subcommand}, try one of: #{Enum.join(@commands, ", ")}"}
        end
      end
    end
  end

  defmacro command(name) do
    quote do
      @base_command unquote(name)
    end
  end

  defmacro subcommand(name, do: rest) do
    quote do
      @commands unquote(name)
      @command unquote(name)
      unquote(rest)
    end
  end

  defmacro args(args) when is_list(args) do
    quote do
      @args {@command, unquote(args)}
    end
  end

  defmacro doc(documentation) when is_binary(documentation) do
    quote do
      @docs {@command, unquote(documentation)}
    end
  end

  defmacro handler(fun_name) when is_atom(fun_name) do
    quote do
      @handlers {@command, unquote(fun_name)}
    end
  end
end