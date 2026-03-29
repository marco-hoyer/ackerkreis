# Project goals

This project is a management system for a solidarity farming community. Including the following set of features:
* vegetables are distributed through local distribution centers
* management of users 
  * users have/share a subscription which is the legal basis for vegetables delivery
  * users can give votes
* subscriptions
  * the community calculates a gross income they need to run the farm
  * are renewed on a yearly basis
  * have a unique ID in the form S{4digits}.
  * users give votes for the monthly price they're willing to pay 
  * if the total amount of votes matches the needed income the bidding is done for the year
  * subscriptions belong to a distribution center
* user touchpoints
  * users can login through an easy passwordless login via a code sent to them by email or passkeys
  * users can see their subscription data
  * users can give votes for the next year if a voting is started
  * users can see a shared list of cooking recipes
  * users can see blog entries shared with all users
* backend system for a group of admins only with
  * financials
  * creating blog entries
  * managing users and subscriptions
  * reviewing applications
* income tracking
  * the system is able to ingest banking transactions via a csv file and matches those via the subscription ID given in the description of the banking transaction
  * statistics are given on the expected vs actual income and subscriptions having a negative balance
* public frontend
  * a public frontend shall provide some information and pictures about the whole project
  * an application form can be filled which will be stored for later review
* email system sending emails to different audiences when
  * application form was filled
  * blog entries were published

# Tech Stack

* Typescript for frontend and backend
* Postgres DB
* everything wrapped in docker containers

# Testing

* docker compose setup to bring everything up in a testing mode prefilled with some data
* unit tests testing the most important logic parts
