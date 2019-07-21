.PHONY: help

GCR_PROJECT ?= piazza-247002
APP_NAME ?= gql
APP_VSN ?= `cat VERSION`
BUILD ?= `git rev-parse --short HEAD`

help:
	@echo "============================~Piazza~=============================="
	@echo "=  Basic build utilities for the piazza application ecosystem.   ="
	@echo "=  Anything build-system-y should be defined here.               ="
	@echo "=================================================================="
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCR_PROJECT)/$(APP_NAME):$(APP_VSN) .

run: ## Run the app in Docker
	docker run --env-file config/docker.env \
		--expose 4000 -p 4000:4000 \
		--rm -it $(APP_NAME):latest

push: ## push to gcr
	docker push gcr.io/$(GCR_PROJECT)/$(APP_NAME):$(APP_VSN)

install: ## install (via helm) in the piazza namespace of the current kube context
	helm install --name piazza --namespace piazza --values charts/piazza/config.secrets.yaml charts/piazza

uninstall: ## purge the current helm installation
	helm del --purge piazza

upgrade: ## upgrade the current helm installation
	helm upgrade -f charts/piazza/config.secrets.yaml piazza charts/piazza

secretsup: ## uploads the current secret conf to kubernetes.  Retrieve with secretsdown
	kubectl create secret generic helm-secrets -n piazza --from-file charts/piazza/config.secrets.yaml

secretsdown: ## downloads the current secret conf to the canonical yaml file
	kubectl get secret helm-secrets -n piazza -o jsonpath="{.data['config\.secrets\.yaml']}" \
		| base64 -D > charts/piazza/config.secrets.yaml

test: ## run tests
	mix test

serve: ## run as a local server (gql is on port 4001, rtc on 4000)
	mix phx.server

testsetup: ## setup test dependencies
	docker-compose up -d

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
	kubectl create secret generic externaldns-serviceaccount --from-file=credentials.json=creds/externaldns.json -n piazza