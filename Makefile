.PHONY: help

GCP_PROJECT ?= piazza-247002
APP_NAME ?= gql
APP_VSN ?= `cat VERSION`
BUILD ?= `git rev-parse --short HEAD`

help:
	@echo "============================~Piazza~=============================="
	@echo "=  Basic build utilities for the piazza application ecosystem.   ="
	@echo "=  Anything build-systemy should be defined here.                ="
	@echo "=================================================================="
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
ifeq ($(APP_NAME), www)
	cd www && docker build -t $(APP_NAME):`cat ../VERSION` \
							-t $(APP_NAME):latest \
							-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):`cat ../VERSION` .
else
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) .
endif

push: ## push to gcr
	docker push gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN)

uninstall: ## purge the current helm installation
	helm del --purge piazza

install: ## upgrade (or install if not present) the current helm installation
	helm upgrade --install --namespace piazza -f charts/piazza/config.secrets.yaml piazza charts/piazza

secretsup: ## uploads the current secret conf to kubernetes.  Retrieve with secretsdown
	kubectl delete secret helm-secrets -n piazza || echo "Creating Secret"
	kubectl create secret generic helm-secrets -n piazza --from-file charts/piazza/config.secrets.yaml

secretsdown: ## downloads the current secret conf to the canonical yaml file
	kubectl get secret helm-secrets -n piazza -o jsonpath="{.data['config\.secrets\.yaml']}" \
		| base64 -D > charts/piazza/config.secrets.yaml

test: ## run tests
	export GOOGLE_APPLICATION_CREDENTIALS=`cat ~/gcp.json`
	mix test

serve: ## run as a local server (gql is on port 4001, rtc on 4000)
	mix phx.server

web: ## starts a local webserver
	cd www && npm start

testup: ## setup test dependencies
	docker-compose up -d

connectdb: ## proxies the db in kubernetes via kubectl
	@echo "run psql -U piazza -h 127.0.0.1 piazza to connect"
	kubectl port-forward statefulset/piazza-postgresql 5432 -n piazza

cli:
	@echo "Ensuring helm is installed..."
	which helm || brew install kubernetes-helm || echo "Go to the helm website for better installation instructions"
	@echo "setting up your gcloud cli (follow the instructions from google to install first)..."
	gcloud init
	gcloud services enable container.googleapis.com
	gcloud services enable storage-api.googleapis.com
	gcloud services enable storage-component.googleapis.com
	gcloud services enable dns.googleapis.com

bootstrap: ## initialize your helm/kubernetes environment
	# create the cluster
	gcloud container clusters create piazza \
    --enable-ip-alias \
    --create-subnetwork="" \
    --network=default \
    --zone=us-east1-b

	gcloud container clusters get-credentials piazza

	# setup helm, perhaps with too broad rbac perms
	kubectl -n kube-system create serviceaccount tiller
	kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
	helm init --service-account=tiller

	# setup the piazza namespace
	kubectl create namespace piazza
	kubectl annotate namespace piazza cnrm.cloud.google.com/project-id=$(GCP_PROJECT)

	# set up external dns service account manually because config connector is still behind
	gcloud iam service-accounts create external-dns || echo "external-dns service account already created"
	gcloud projects add-iam-policy-binding $(GCP_PROJECT) \
		--member serviceAccount:external-dns@$(GCP_PROJECT).iam.gserviceaccount.com --role roles/dns.admin
	gcloud iam service-accounts keys create --iam-account \
                external-dns@$(GCP_PROJECT).iam.gserviceaccount.com credentials.json
	kubectl create secret generic externaldns --from-file credentials.json --namespace piazza
	rm credentials.json
	
	# set up gcp config connector
	gcloud iam service-accounts create cnrm-system
	gcloud projects add-iam-policy-binding $(GCP_PROJECT) \
		--member serviceAccount:cnrm-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--role roles/owner
	gcloud projects add-iam-policy-binding $(GCP_PROJECT) \
		--member serviceAccount:cnrm-system@$(GCP_PROJECT).iam.gserviceaccount.com \
		--role roles/storage.admin
	gcloud iam service-accounts keys create --iam-account \
 		cnrm-system@$(GCP_PROJECT).iam.gserviceaccount.com key.json
	gcloud services enable cloudresourcemanager.googleapis.com
	
	kubectl create namespace cnrm-system
	kubectl create secret generic gcp-key --from-file key.json --namespace cnrm-system
	rm key.json

	curl -X GET -LO \
		-H "Authorization: Bearer `gcloud auth print-access-token`" \
		--location-trusted \
		https://us-central1-cnrm-eap.cloudfunctions.net/download/latest/infra/install-bundle.tar.gz
	
	tar -zxvf install-bundle.tar.gz
	kubectl apply -f install-bundle/
	rm -rf install-bundle/
	rm install-bundle.tar.gz
