variable "cluster_name" {
  type = "string"
  default = "piazza"
}

variable "piazza_bucket" {
  type = "string"
  description = <<EOF
The bucket the piazza deployment will actually use
EOF
}

variable "gcp_location" {
  type = "string"
  default = "us-east1-b"
  description = <<EOF
The region you wish to deploy to
EOF
}

variable "gcp_project_id" {
  type = "string"
  description = <<EOF
The ID of the project in which the resources belong.
EOF
}