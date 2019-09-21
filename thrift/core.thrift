#@ namespace elixir Core.Generated

struct PingParticipant {
  1: string user_id;
  2: string conversation_id;
}

struct PubSubEvent {
  1: string event;
}

struct ActiveUser {
  1: string user_id;
}

struct ActiveUsers {
  1: list<ActiveUser> active_users;
}

struct ActiveUserRequest {
  1: string scope;
}

service GqlService {
  bool pingParticipant(PingParticipant request)
}

service RtcService {
  bool publishEvent(PubSubEvent event)

  ActiveUsers listActive(ActiveUserRequest req)
}