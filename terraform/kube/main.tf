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

data "google_container_cluster" "piazza_cluster" {
  name = "${var.cluster_name}"
  location = "${var.gcp_location}"
}

provider "kubernetes" {
  host = "${data.google_container_cluster.piazza_cluster.endpoint}"
}

###
# Service accounts.  We create one for externaldns, one for cnrm, and one for piazza itself
###

resource "google_service_account" "externaldns" {
  account_id   = "externaldns"
  display_name = "ExternalDns"
}

resource "google_service_account_key" "externaldns" {
  service_account_id = "${google_service_account.externaldns.name}"
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    "google_service_account.externaldns"
  ]
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
    "google_storage_bucket.piazza_bucket",
    "google_service-account.piazza"
  ]
}

##
# Iam bindings for the various service accounts.
##

resource "google_project_iam_member" "externaldns_dns_admin" {
  project = "${var.gcp_project_id}"
  role    = "roles/dns.admin"

  member = "serviceAccount:${google_service_account.externaldns.email}"

  depends_on = [
    "google_service_account.externaldns"
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

resource "kubernetes_secret" "externaldns" {
  metadata {
    name = "externaldns"
    namespace = "piazza"
  }
  data = {
    "credentials.json" = "${base64decode(google_service_account_key.externaldns.private_key)}"
  }

  depends_on = [
    "kubernetes_namespace.piazza"
  ]
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

resource "kubernetes_service_account" "tiller" {
  metadata {
    name = "tiller"
    namespace = "kube-system"
  }
}

resource "kubernetes_cluster_role_binding" "tiller" {
  metadata {
    name = "tiller"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "cluster-admin"
  }
  subject {
    kind      = "ServiceAccount"
    name      = "tiller"
    namespace = "kube-system"
  }
}