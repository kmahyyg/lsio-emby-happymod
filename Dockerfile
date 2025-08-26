# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 as builder

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /codebuild
COPY ./embyHappyMod ./embyHappyMod

RUN apt-get update -y && apt-get install -y build-essential zlib1g-dev tree
RUN mkdir -p /output
RUN cd embyHappyMod && dotnet publish -o /output

# copy s6 related service files
COPY root/ /root-layer/
# add binaries and exectuables
RUN mkdir -p /root-layer/usr/local/bin ; cp -ar /output/embyHappyMod /root-layer/usr/local/bin/embyHappyMod ; chmod +x /root-layer/usr/local/bin/embyHappyMod ; tree /root-layer


# single layer deployed image
FROM scratch

LABEL org.opencontainers.image.source="https://github.com/kmahyyg/lsio-emby-happymod"
LABEL MAINTAINER="Patrick Young <16604643+kmahyyg@users.noreply.github.com>"
LABEL Description="Emby Docker HappyMod for LinuxServer.io-Based Images"

# copy output from build stage, this MUST be a single-layer image, otherwise it is incomplete mod
COPY --from=builder /root-layer/ /