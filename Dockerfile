# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 as builder

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /codebuild
COPY ./embyHappyMod .

RUN apt-get update -y && apt-get install -y build-essential zlib1g-dev tree
RUN mkdir -p /output
RUN pwd; tree . ; cd embyHappyMod && dotnet publish -o /output ; tree /output

# single layer deployed image
FROM scratch

LABEL org.opencontainers.image.source="https://github.com/kmahyyg/lsio-emby-happymod"
LABEL MAINTAINER="Patrick Young <16604643+kmahyyg@users.noreply.github.com>"
LABEL Description="Emby Docker HappyMod for LinuxServer.io-Based Images"

COPY --from=builder --chmod=755 /output/embyHappyMod /usr/local/bin/embyHappyMod
