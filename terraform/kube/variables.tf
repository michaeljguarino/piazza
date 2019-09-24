variable "cluster_name" {
  type = string
  default = "piazza" 
}

variable "backend_bucket" {
  type = "string"
  
  description = <<EOF
The bucket to use for storing tf state
EOF
}

variable "piazza_bucket" {
  type = "string"
  description = <<EOF
The bucket the piazza deployment will actually use
EOF
}

variable "gcp_location" {
  type = string
  default = "us-east1-b"
}

variable "gcp_project_id" {
  type = string
  description = <<EOF
The ID of the project in which the resources belong.
EOF
}