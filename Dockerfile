FROM rust:1-bookworm AS build
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends musl-tools \
    && rm -rf /var/lib/apt/lists/* \
    && rustup target add x86_64-unknown-linux-musl
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl --bin calendar-server

# Export stage for the release workflow: docker buildx build --target binary --output out .
FROM scratch AS binary
COPY --from=build /build/target/x86_64-unknown-linux-musl/release/calendar-server daymark-server

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /build/target/x86_64-unknown-linux-musl/release/calendar-server /usr/local/bin/calendar-server
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/calendar-server"]