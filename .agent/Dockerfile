FROM debian:bookworm-slim@sha256:56ff6d36d4eb3db13a741b342ec466f121480b5edded42e4b7ee850ce7a418ee

ENV PATH=/home/agent/.local/bin:$PATH
WORKDIR /home/agent/workspace

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        gh \
        git \
        jq \
        ripgrep \
				sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --uid 1000 --shell /bin/bash agent && \
    echo "agent ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/agent && \
    chmod 0440 /etc/sudoers.d/agent && \
    chown -R agent:agent /home/agent
USER agent

ENV MISE_VERSION=v2026.1.4
RUN curl https://mise.run | sh
ENV PATH=/home/agent/.local/share/mise/shims:$PATH
RUN echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc

COPY --chown=agent:agent .tool-versions .
RUN mise install
RUN rm .tool-versions

ENV OPENCODE_VERSION=1.1.25
RUN curl -fsSL https://opencode.ai/install | bash -s -- --version ${OPENCODE_VERSION} --no-modify-path
ENV PATH=/home/agent/.opencode/bin:$PATH
RUN mkdir -p /home/agent/.local/share/opencode
RUN ln -s /mnt/opencode-data/auth.json /home/agent/.local/share/opencode/auth.json

ENTRYPOINT [ "opencode", "web", "--hostname", "0.0.0.0", "--port", "4096" ]
