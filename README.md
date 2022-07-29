# Ticket Monitor

This is a simple tool to monitor the availability of tickets on websites that sell them. It doesn't automate the acquisition of tickets, just monitors the presence of certain HTML elements on a page. It doesn't need to be tickets, technically you can repurpose it to any similar task, but this was the reason I created it.

## How It Works

### Overview

There is an **API** to which you can submit ticket monitoring requests. **API** puts those requests in a **Database** (currently only [MongoDB](https://www.mongodb.com) is supported).

There is also a **Worker** that monitors the **Database** for requests and executes them periodically. Ticket monitoring request execution involves downloading a web page and searching for a specific HTML element in it (usually it will be something like "Add to Cart Button"). If the specified HTML element is found, the request is removed from the **Database** and report is generated according to configuration provided in ticket monitoring request (currently only **Telegram** notifications are supported).

### Terms
- `TicketMonitoringRequest` is the primary domain entity. Contains `SearchCriteria` and `ReportSettings`.
- `SearchCriteria` defines how to find HTML elements on a page. It is hierarchical in nature and is represented by a chain of nodes. Each node can contain a child node. The last node (without a child) must describe the target HTML element. All parent nodes are there to narrow down the search. In most cases a single node would suffice, especially if target HTML element has an id of some sort.
- `ReportSettings` define how to dispatch a notification when **Worker** discovers the target HTML element.

### Tech
- [Deno](https://deno.land) is chosen as the runtime purely out of my curiosity.
- [MongoDB](https://www.mongodb.com) is chosen as the database to allow easy persistence of `SearchCriteria` objects, which can be of arbitrary depth. Also because MongoDB's cloud service ([Atlas](https://www.mongodb.com/atlas/database)) has a free tier.

## How To Run It

There are multiple ways to run the tool.

### Configuration

First of all, you'll need a dotenv configuration file that contains the following values:
1. `MONGO_DB_CONNECTION_STRING`: connection string to your MongoDB instance.
2. `RETRY_INTERVAL_MS`: this is the interval when **Worker** will pull the ticket monitoring requests from **Database** and execute them.
3. (Optional) `TG_BOT_TOKEN`: this is the auth token for [Telegram bot](https://core.telegram.org/bots) that will send you messages (provided that you have a Telegram account) when **Worker** will discover that tickets are available. If you don't specify the token, you won't get notified. Currently **Telegram** is the only supported communication channel.
4. `API_KEY`: this is auth key that protects the API. Put it in `X-API-Key` header in requests to API.
5. `PORT`: this is the port that API server will be running on.

### Locally

1. Create file named `.local.env` at the root of the repo and put some values into it.
2. Make sure you have `MongoDB` running somewhere. Easiest way is to run it via Docker though (just run `./docker-start-mongo.sh`). Make sure to put the correct connection string into `.local.env` (e.g. `mongodb://localhost:27017/ticket-monitor`).
3. Run `./start.sh`.

### Locally via Docker

1. Create file named `.docker.env` at the root of the repo and put some values in it.
2. Set `MONGODB_CONNECTION_STRING` to `mongodb://mongo:27017/ticket-monitor`.
3. Run `./docker-start-all.sh`.

### Deploy to Heroku

1. Create an app in [Heroku](https://heroku.com). You can use a free-tier.
2. Run `heroku login`, then `heroku container:login` in terminal. You can consult the [docs](https://devcenter.heroku.com/articles/container-registry-and-runtime) for details.
3. Run `HEROKU_APP_NAME=%YOUR-HEROKU-APP-NAME% ./heroku-release.sh`.

## TODO

- API reference
- File DB for minimal local deployment (SQLite? Plain JSON files?)
- Other notification types (Email? Local desktop notifications?)
- UI to manage monitoring requests
