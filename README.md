# Piazza

A slack/RTC-like messaging system designed to be cheap, modern and distributable via kubernetes.

An example deployment is available at http://chat.piazzaapp.com.

## Features

This is currently a near-complete slack app.  Some of the features include:

* realtime message delivery and user presence
* public and private channels along with private 1-1 and group chats
* slash commands
* structured messages (with support in slash-command webhook responses)
* link unfurling using opengraph meta headers
* message and conversation search, with permission scoping for each
* message pinning
* message attachments
* multiline messages
* @-mentions, full emoji support with search (both support typeahead completion)
* markdown support
* emoji reactions for messages
* configurable message retention

The underlying api is implemented using graphql with elixir as the language choice.  Graphql was used mainly because I wanted to experiment with it, but also it has one of the more future-proof subscription mechanisms I've seen. The web client is written in react.

The current default configuration will consume around 4cpus in a kubernetes cluster.  I haven't stress-tested it by any means, but I wouldn't be surprised if that supported normal usage for a few hundred users.  Cost comparison with slack even after just 10 or so users is very favorable (unless you're on free of course).

The other huge win is privacy.  Not only do you maintain complete control over your information, you can also self-host your integrations without having to expose them to the public internet (just slap kube service discovery on them, configure your command to point to that and neglect ever creating an ingress).

## Installation

You'll need elixir installed locally to develop on the api.  I'd recommend installing it via `asdf`, you can read more details about it here: https://asdf-vm.com/#/. There is already a .tool-versions present in the repo to specify the elixir/erlang versions needed.  Test dependencies are managed via docker using compose.

To run tests:

```bash
cd /path/to/piazza
make testsetup
mix do local.hex, local.rebar
mix deps.get
mix test
```

## Architecture
The app is separated into three main deployable components:

* gql - the graphql api
* rtc - the websocket handler for graphql subscriptions
* cron - jobs for things like deleting old messages, notifications, etc.
* aquaduct - queue topology
* www - the react frontend

Mutual dependencies usually live in core.  Unfortunately this includes the graphql schema for now since we need to distribute it to gql and rtc.  The second app also allows us to spin up an event broadcaster in cron where needed.

Additionally, the app currently requires a postgresql db and rabbitmq (for reliable delivery of realtime events to rtc and webhooks).  For local testing, both are configured in the docker-compose.yml file.

## Build/Installation

Most management tasks are present in the Makefile.  Some basic commands:

```bash
make build APP_NAME=gql # build the gql release in docker

make push APP_NAME=gql # push it to my gcr docker registry

make install # runs helm install on the current chart in the repo

make upgrade # updates the helm installation with the current values

make bootstrap # creates a gke cluster, and initializes helm for you
```

## Setup

On bootstrap, an admin user with email `admin@example.com` and password `temporary_password` is created.  In addition, the townhall public conversation is added, and a few simple slash commands are added to the workspace.

The admin user is customizable.  You'll also want to create a few service accounts for your gcp account.  The command `make bootstrap` will assume the credentals for both are stored in the `creds/` folder (which is gitignored).  They are:

* creds/gcp.json - allow access to the bucket configured at `gcp.gcsBucket` in your helm chart values
* creds/externaldns.json - if you choose to install externaldns with this chart, give access to clouddns to this service account


The current setup is fairly closely tied to gcp.  It will configure a GCP NEG loadbalancer, for instance, which is what's required to implement target stickiness for websockets.  In addition, it will configure things like ssl certificates using the GKE-standard method.

## Acknowledgments

This project uses a lot of great open source tech worthy of a mention:

* absinthe - elixir graphql implementation
* phoenix/ecto - elixir webserver and persistence frameworks
* conduit - elixir generalized queueing dsl
* grommet - react component library
* slate - react text editor
* apollo - graphql client implementation