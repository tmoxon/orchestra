FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl git jq unzip zip \
    build-essential findutils grep gawk sed \
    openssh-client vim gnupg \
 && rm -rf /var/lib/apt/lists/*

# Install Node 20 (Nodesource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get update && apt-get install -y nodejs \
 && npm -v && node -v

# non-root user
RUN useradd -ms /bin/bash dev
USER dev
WORKDIR /workspace

ENTRYPOINT ["/bin/bash","-lc"]
CMD ["sleep infinity"]
