license: {{ .License | quote }}

postgresql:
  postgresqlPassword: {{ dedupe . "piazza.postgresql.postgresqlPassword" (randAlphaNum 26) }}

rabbitmq:
  rabbitmq:
    password: {{ dedupe . "piazza.rabbitmq.rabbitmq.password" (randAlphaNum 26) }}
    erlangCookie: {{ dedupe . "piazza.rabbitmq.rabbitmq.erlangCookie" (randAlphaNum 26) }}
  auth:
    password: {{ dedupe . "piazza.rabbitmq.rabbitmq.password" (randAlphaNum 26) }}
    erlangCookie: {{ dedupe . "piazza.rabbitmq.rabbitmq.erlangCookie" (randAlphaNum 26) }}

secrets:
  jwt: {{ dedupe . "piazza.secrets.jwt" (randAlphaNum 26) }}
  erlang: {{ dedupe . "piazza.secrets.erlang" (randAlphaNum 26) }}
  invite_secret: {{ dedupe . "piazza.secrets.invite_secret" (randAlphaNum 26) }}

gql:
  gcsBucket: {{ .Values.piazzaBucket }}

admin:
  email: {{ .Values.adminEmail }}
  handle: {{ .Values.adminHandle }}
  name: {{ .Values.adminName }}
  password: {{ dedupe . "piazza.admin.password" (randAlphaNum 26) }}

defaultWorkspace: {{ default "general" .Values.defaultWorkspace }}

ingress:
  dns: {{ .Values.piazzaDns }}