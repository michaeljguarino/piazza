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

## Configuration

Example configuration:

```yaml
postgresql:
  postgresqlPassword: psql_password

rabbitmq:
  rabbitmq:
    password: rabbit_password
    erlangCookie: erlang_cookie

secrets:
  jwt: jwt_secret
  giphy: giphy_application_key
  erlang: piazza_erlang_cookie
  # optional if you want to enable the built in github command
  github_secret: secret_for_github_webhook
  github_incoming_webhook: generated_github_incoming_webhook

admin:
  email: admin@example.com
  handle: admin
  name: "Your Admin"
  password: "obviously a super strong password"

gql:
  gcsBucket: piazza-uploads
```

## More configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| gql.replicaCount | number of api replicas | 2 |
| rtc.replicaCount | number of rtc replicas | 2 |
| www.replicaCount | number of www replicas | 1 |
| {gql,rtc,www}.resources | resource configuration for the 3 underlying deployments | {} |
| retentionPolicy.value | the number of days to keep messages by default | 5 |
| notificationRetentionPolicy.value | the number of days to keep notifications | 5 |
| ingress.dns | the dns name to register under | chat.piazzaapp.com |
| ingress.enabled | whether to provision an ingress | true |

In addition, it depends on the stable postgres and rabbitmq helm charts, consult them for further documentation