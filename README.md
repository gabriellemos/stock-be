# Stock Controll

Backend application to track stocks and manage portfolio.

## Developer Notes

This system was invisioned to work with [B3](https://www.b3.com.br/) (brazilian stock exchange), it's possible that it can track stocks from multiple exchanges but this wasn't tested so we can't garantee that it will work fine without any extra changes.

## Features and Future Plans

The application has the following features:

- Mailler service
  - ✓ Confirm sign up link
  - ✓ Forgot password link
  - Notify password updated
- User management
  - ✓ Create user
  - ✓ Set password
  - ✓ Update password
- Authentication
  - ✓ Login with email and password
  - ✓ Refresh the access token
  - ✓ Logout
- Stock tracking
  - ✓ Track stock (open, high, low, close, and volume)
  - ✓ Simplified history within period (1 month, 1 year, 5 years, max)
  - ✓ Interactable history
    - ✓ Paginated results (cursor based)
    - ✓ History groupings (day, week, month, trimester, semester, year)
- Protfolio management
  - Unified portfolio
  - Manage portfolio (create, edit, delete)
  - Manage position (register new position, update position)
    - Buy Order
    - Sell Order
    - Stock Split
    - Stock Grouping
    - Stock Subscription
    - Bonus Issue
  - Import position (xls)
  - Export position (xls)
- Shared portfolio
- Achievements

## Project setup

Running this project will required you to have docker configured and have the environment variable file set.

Docker is used to configured a clean instance of the database for development use as well as the database used for e2e tests. The `.env` contains secret keys and other configurable information used by the application.

### Development Database

> If you don't have docker installed at your environment, access [docker.com](https://www.docker.com/), download and install docker desktop at your machine.

Within the project folder, you should be able to see the `docker-compose.yml` file. Open the terminal and execute the following command and let docker handle all the database configuration for this project.

```bash
$ docker-compose up -d
```

### Testing Database (e2e)

No extra configuration needed. A script is executed to start the Docker container used for tests and than stop and remove the Docker container at the end of those tests.

### Environment Variable

> A script will be created to some-what configure the `.env` and `.env.test.local`

First of all, you need to copy the template `.env.tpl` and create both the `.env` and the `.env.test.local` files.

#### Authentitation keys

The configurable keys used for authentication are JWT Access and JWT Refresh secrets. Feel free to access [randomkeygen.com/](https://randomkeygen.com/) and generate a key for `JWT_ACCESS_TOKEN_SECRET` and another for `JWT_REFRESH_TOKEN_SECRET`

#### Mailer service

> Please note that the "app password" is different from the password used to connect to your Google account.

The mailer service requires the **email** of the account it will be used for sending emails and the **app password** for that account.

To create a new **app password** follow these steps:

1. Visit and login to [myaccount.google.com](https://myaccount.google.com/)
1. Navigate to the 'Security' tab.
1. Select and enable '2-Step Verification'
1. Scroll to the bottom of the screen, where you'll find the 'App passwords' option.

Choose this option, and it will prompt you to specify your application's name. Provide the necessary details, and you will receive a unique code. This code should be used in place of your actual password.

Once you have your both information, save them to `MAIL_USERNAME` and `MAIL_PASSWORD`.

#### Database keys

Check the `docker-compose.yml` file and double check if the following configuration is true for the `mongo-db` service.

```.env
DATABASE_USER=root
DATABASE_PASS=1234abcd56
DATABASE_HOST=mongodb://localhost:27017
DATABASE_NAME=stock-controll
```

#### Google Sheets API

To enable the Google Sheets API and generate the `credentials.json`, follow these steps

1. Access [console.cloud.google.com](https://console.cloud.google.com/)
1. Select the project your're working on (i.e. Stock Pricing)
1. Search for: "Google Sheets API" and select it
1. Enable if not already enabled
1. Hit the "Manage" button
1. When the Service Details is loaded, select the "Credentials" tab
1. On the Service Accounts table, hit the "Manage service accounts" button
1. When the Service accounts page is loaded, hit the "Create service account" button
1. You will be requested to fill the service account details, no need to grant extra permissions.
1. Create service account.

When the account is created, you will be redirected to the "Service accounts", where you should see the service account you just created. Take this moment to copy the account email as it will be used in a later step.

1. On your service account row, hit the actions button and select the "Manage keys" options.
1. Click the "Add Key" button and select the "Create new key" option.
1. Select JSON as the key type and click the "Create" button.

A JSON file will be downloaded when the key is created, move that file to the root directory of this project and rename it to `credentials.json` so it's not commited to the git repository.

Now that we have the `credentials.json` set, let's configure the spreadsheet used to track the stocks.

1. Access [sheet.new](https://sheet.new) to create a new spreadsheet o google drive.
1. Feel free to name it however you like it but make sure it has two sheets named `Sheet1` and `Sheet2`.
1. Share the sheet with the email of the Service Account we just created.
1. Share it as "Editor".

The remaining key `SPREADSHEET_ID` is the the ID of the spreadsheet we just created. It can be extracted from the URL itself.

```https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## FAQ - Stocks

### What is a stock portifolio?

A stock portfolio is a collection of investments held by an individual or entity, including stocks, bonds, mutual funds, ETFs, and other securities. It reflects the diversity of investments intended to balance risk and reward. A well-diversified portfolio reduces the impact of poor performance in a single stock.

### What is a split?

A stock split occurs when a company increases the number of its outstanding shares to make its stock more affordable to investors without changing the total market capitalization.

Example: In a 2-for-1 split, one existing share is divided into two, and its price is halved. If a stock trades at $100 before the split, it will trade at $50 after the split, but the investor owns twice as many shares.

### What is a grouping?

In stock market terms, grouping (also called a reverse split) is the opposite of a stock split. A company consolidates its shares, reducing the number of outstanding shares while increasing the price of each share proportionally.

Example: In a 1-for-10 reverse split, 10 shares are combined into 1, so if an investor holds 100 shares at $1 each, they will own 10 shares at $10 each after the grouping.

### What is a subscription?

A stock subscription refers to the process of purchasing shares in a company, typically during an initial public offering (IPO) or additional share issuance. Investors agree to buy the shares at a specified price, often before they are publicly available.

### What is a bonus issue?

A bonus issue (or bonus shares) is when a company issues additional shares to its existing shareholders for free, based on the number of shares they already own. This is done to reward shareholders without requiring them to invest more money.

Example: In a 1:2 bonus issue, for every two shares an investor owns, they receive one additional share.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
