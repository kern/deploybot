.PHONY: deps
deps:
	yarn install

.PHONY: build
build:
	yarn tsc

.PHONY: deploy
deploy:
	gcloud functions deploy deploybot \
		--runtime nodejs8 \
		--memory 128MB \
		--trigger-http \
		--env-vars-file=.env.yaml \
		--entry-point=main
