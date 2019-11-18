terraform {
  # Use a GCS Bucket as a backend
  backend "gcs" {
    prefix = "terraform/kube"
  }
}

locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

provider "google" {
  version = "2.5.1"
  project = "${var.gcp_project_id}"
  region  = "${local.gcp_region}"
}

data "google_client_config" "current" {}

data "google_container_cluster" "cluster" {
  name = "${var.cluster_name}"
  location = "${var.gcp_location}"
}

provider "kubernetes" {
  load_config_file = false
  host = "${data.google_container_cluster.cluster.endpoint}"
  cluster_ca_certificate = "${base64decode(data.google_container_cluster.cluster.master_auth.0.cluster_ca_certificate)}"
  token = "${data.google_client_config.current.access_token}"
}

resource "google_service_account" "piazza" {
  account_id = "piazza"
  display_name = "Service account for piazza"
}

resource "google_service_account_key" "piazza" {
  service_account_id = "${google_service_account.piazza.name}"
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    "google_service_account.piazza"
  ]
}

##
# Create our gcs bucket
##

resource "google_storage_bucket" "piazza_bucket" {
  name = "${var.piazza_bucket}"
  project = "${var.gcp_project_id}"
  force_destroy = true
}

resource "google_storage_bucket_acl" "piazza_bucket_acl" {
  bucket = "${google_storage_bucket.piazza_bucket.name}"
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_iam_member" "piazza" {
  bucket = "${google_storage_bucket.piazza_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.piazza.email}"

  depends_on = [
    google_storage_bucket.piazza_bucket,
    google_service_account.piazza,
    google_storage_bucket_acl.piazza_bucket_acl
  ]
}

##
# Finally tie everything back into our cluster
##

resource "kubernetes_namespace" "piazza" {
  metadata {
    name = "piazza"
    annotations = {
      "cnrm.cloud.google.com/project-id" = "${var.gcp_project_id}"
    }
  }
}

resource "kubernetes_secret" "piazza" {
  metadata {
    name = "piazza-serviceaccount"
    namespace = "piazza"
  }
  data = {
    "key.json" = "${base64decode(google_service_account_key.piazza.private_key)}"
  }

  depends_on = [
    "kubernetes_namespace.piazza"
  ]
}