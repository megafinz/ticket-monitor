FROM denoland/deno:1.24.0

WORKDIR /app

USER deno

COPY src/deps.ts .
RUN deno cache deps.ts

ADD /src .
RUN deno cache main.ts

CMD [ "run", "--allow-net", "--allow-env", "--allow-run", "--allow-read", "main.ts" ]
