FROM denoland/deno:1.24.0

WORKDIR /app

USER deno

COPY src/deps/ deps/
RUN deno cache deps/all.ts

ADD /src .
ADD /migrations/ migrations/
RUN deno cache main.ts

CMD [ "run", "--allow-net", "--allow-env", "--allow-run", "--allow-read", "main.ts" ]
