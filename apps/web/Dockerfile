FROM oven/bun:1.1.38

WORKDIR /workspace

COPY . .

RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "--cwd", "apps/web", "dev", "--hostname", "0.0.0.0", "--port", "3000"]
