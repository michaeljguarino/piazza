#@ namespace elixir Core.Generated

struct PingParticipant {
  1: string user_id;
  2: string conversation_id;
}

service Service {
  bool pingParticipant(PingParticipant request)
}