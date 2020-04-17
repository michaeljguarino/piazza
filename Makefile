.PHONY: help

GCP_PROJECT ?= piazzaapp
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
							-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):`cat ../VERSION` \
							-t dkr.piazza.app/piazza/${APP_NAME}:`cat ../VERSION` .
else
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) \
		-t dkr.piazza.app/piazza/${APP_NAME}:$(APP_VSN) .
endif

push: ## push to gcr
	docker push gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN)
	docker push dkr.piazza.app/piazza/${APP_NAME}:${APP_VSN}

uninstall: ## purge the current helm installation
	helm del --purge piazza

install: ## upgrade (or install if not present) the current helm installation
	helm upgrade --install --namespace piazza -f charts/piazza/config.secrets.yaml piazza charts/piazza

test: ## run tests
	export GOOGLE_APPLICATION_CREDENTIALS=`cat ~/gcp.json`
	mix test

serve: ## run as a local server (gql is on port 4001, rtc on 4000)
	mix phx.server

web: ## starts a local webserver
	cd www && npm start

testup: ## setup test dependencies
	docker-compose up -d

testdown: ## tear down test dependencies
	docker-compose down

connectdb: ## proxies the db in kubernetes via kubectl
	@echo "run psql -U piazza -h 127.0.0.1 piazza to connect"
	kubectl port-forward statefulset/piazza-postgresql 5432 -n piazza

grpc:
	protoc --elixir_out=plugins=grpc:./apps/core/lib/core proto/piazza.proto