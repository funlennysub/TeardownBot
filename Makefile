.PHONY: run
run:
	docker-compose --profile bot up -d

.PHONY: build
build:
	docker-compose --profile bot build

.PHONY: stop
stop:
	docker-compose down