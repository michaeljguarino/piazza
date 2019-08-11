#@ namespace elixir Core.Generated

struct PingParticipant {
  1: string user_id;
  2: string conversation_id;
}

struct PubSubEvent {
  1: string event;
}

service Service {
  bool pingParticipant(PingParticipant request)
}

service RtcService {
  bool publishEvent(PubSubEvent event)
}