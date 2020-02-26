# Piazza

A slack/IRC-like messaging system designed to be cheap, modern and distributable via kubernetes.

An example deployment is available at https://chat.piazzaapp.com.

## Features

This is currently a near-complete slack app.  Some of the features include:

* realtime message delivery, user presence, typing presence
* public and private channels along with private 1-1 and group chats
* slash commands
* incoming webhooks with configurable message routing
* structured messages (with support in slash-command webhook responses)
* link unfurling using opengraph meta headers
* message and conversation search, with permission scoping for each
* message pinning
* message attachments
* multiline messages
* @-mentions, emoji support, custom emoji
* markdown support
* emoji reactions
* theme support
* configurable message retention

The underlying api is implemented using graphql with elixir as the language choice.  Graphql was used mainly because I wanted to experiment with it, but also it has one of the more future-proof subscription mechanisms I've seen. The web client is written in react.

The current default configuration will consume around 1.5cpus in a kubernetes cluster (if you're being stingy).  I haven't stress-tested it by any means, but I wouldn't be surprised if that supported normal usage for a few hundred users.  Cost comparison with slack even after just 10 or so users is very favorable (unless you're on free of course).

The other huge win is privacy.  Not only do you maintain complete control over your information, you can also self-host your integrations without having to expose them to the public internet (just slap kube service discovery on them, connect the pipes, and neglect ever creating an ingress).

## Installation

### To install in your own account:

You'll need both helm and terraform to fully install the system.  (If you already have a kube cluster,
you can skip most of the tf part, although you still might need to create a bucket for file assets, ensure
you have an ingress controller enabled, etc.)

```bash
make cli # if you haven't installed helm, configured gcloud
make bootstrap # will create a new gke cluster and install a few necessary tools if you haven't already
helm upgrade --install --namespace piazza bootstrap charts/bootstrap # if you need to create the bucket, install external dns
make install # actually installs the chart
```

You can see an example configuration at `charts/values.example.yaml` showing what passwords/secrets need to be configured (don't check this into source control if you choose to put secrets in here of course).

Ideally you reuse existing compute resources if you have an existing productionized cluster, so I wouldn't necessarily insist on the bootstrap scripts as is.  If you do forgo the bootstrap scripts, you will need to create a gcs bucket and service account with access to it, that file should be in a collocated secret named `piazza-serviceaccount`.

### To run tests:

You'll need elixir installed locally to develop on the api.  I'd recommend installing it via `asdf`, you can read more details about it here: https://asdf-vm.com/#/. There is already a .tool-versions present in the repo to specify the elixir/erlang versions needed.  Test dependencies are managed via docker using compose.

```bash
cd /path/to/piazza
make testsetup
mix do local.hex, local.rebar
mix deps.get
mix test
```

To install in your own account:

```bash
make cli # if you haven't installed helm, configured gcloud
make bootstrap # will create a new gke cluster and install a few necessary tools if you haven't already
helm upgrade --install --namespace piazza bootstrap charts/bootstrap # if you need to create the bucket, install external dns
make install # actually installs the chart
```

You can see an example configuration at `charts/values.example.yaml` showing what passwords/secrets need to be configured (don't check this into source control if you choose to put secrets in here of course).

Ideally you reuse existing compute resources if you have an existing productionized cluster, so I wouldn't necessarily insist on the bootstrap scripts as is.  If you do forgo the bootstrap scripts, you will need to create a gcs bucket and service account with access to it, that file should be in a collocated secret named `piazza-serviceaccount`.

## Architecture
The app is separated into three main deployable components:

* gql - the graphql api
* rtc - the websocket handler for graphql subscriptions
* cron - jobs for things like deleting old messages, notifications, etc.

In addition, there's:

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

The admin user is customizable. See the example values.yaml for how that is done.

The current setup is fairly closely tied to gcp.  It will configure a GCP NEG loadbalancer, for instance, which is what's required to implement target stickiness for websockets.  In addition, it will configure things like ssl certificates using the GKE-standard method.

## Acknowledgments

This project uses a lot of great open source tech worthy of a mention:

* absinthe - elixir graphql implementation
* phoenix/ecto - elixir webserver and persistence frameworks
* conduit - elixir generalized queueing dsl
* grommet - react component library
* slate - react text editor
* apollo - graphql client implementation
