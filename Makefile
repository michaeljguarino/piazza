.PHONY: help

GCR_PROJECT ?= piazza-247002
APP_NAME ?= gql
APP_VSN ?= `cat VERSION`
BUILD ?= `git rev-parse --short HEAD`

help:
	@echo "$(APP_NAME):$(APP_VSN)"
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

install:
	helm install --name piazza --namespace piazza --values charts/piazza/config.secrets.yaml charts/piazza

uninstall:
	helm del --purge piazza

upgrade:
	helm upgrade -f charts/piazza/config.secrets.yaml piazza charts/piazza

test:
	mix test

serve:
	mix phx.server

testsetup:
	docker-compose up -d

bootstrap:
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