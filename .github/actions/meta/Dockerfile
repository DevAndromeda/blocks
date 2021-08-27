FROM node:14-slim

LABEL com.github.actions.name="Metadata Generator"
LABEL com.github.actions.description="Commit metadata to the respective branch."
LABEL com.github.actions.icon="upload-cloud"
LABEL com.github.actions.color="blue"

RUN apt-get update && apt-get install -y git

COPY src /actions/meta/src
ENTRYPOINT ["/actions/meta/src/entrypoint.sh"]