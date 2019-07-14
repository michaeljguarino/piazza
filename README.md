# Piazza

A slack/RTC-like messaging system designed to be cheap, modern and distributable via kubernetes

## Installation

You'll need elixir installed locally to develop on the api.  I'd recommend installing it via `asdf`,
you can read more details about it here: https://asdf-vm.com/#/. There is already a .tool-versions
present in the repo to specify the elixir/erlang versions needed.  Test dependencies are managed
via docker using compose.

To run tests:

```
cd /path/to/piazza
docker-compose up
mix test
```