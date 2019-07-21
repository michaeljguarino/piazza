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
make testsetup
mix test
```

## Architecture
The app is separated into three main deployable components:

* gql - the graphql api
* rtc - the websocket handler for graphql subscriptions
* cron - jobs for things like deleting old messages, notifications, etc.

Mutual dependencies usually live in core.  Unfortunately this includes the
graphql schema for now since we need to distribute it to gql and rtc.  The
second app also allows us to spin up an event broadcaster in cron where needed.

Additionally, the app currently requires a postgresql db and rabbitmq (for reliable
delivery of realtime events to rtc and webhooks).

## Build/Installation

Most management tasks are present in the Makefile.  Some basic commands:

```
make build APP_NAME=gql # build the gql release in docker

make push APP_NAME=gql # push it to my gcr docker registry

make install # runs helm install on the current chart in the repo

make upgrade # updates the helm installation with the current values

make bootstrap # creates a gke cluster, and initializes helm for you
```

## Setup

On bootstrap, an admin user with email `admin@example.com` and password `temporary_password` is created.  In addition,
the townhall public conversation is added, and a giphy command is created also.

