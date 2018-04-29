# Translectra

> Open-source Translation Management System in NodeJS.

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/Electra-project/translectra.svg?style=flat-square)](https://travis-ci.org/Electra-project/translectra)
[![David](https://img.shields.io/david/Electra-project/translectra.svg?style=flat-square)](https://david-dm.org/Electra-project/translectra)
[![David](https://img.shields.io/david/dev/Electra-project/translectra.svg?style=flat-square)](https://david-dm.org/Electra-project/translectra)

[![NSP Status](https://nodesecurity.io/orgs/ivan-gabriele/projects/9a5931e7-b38c-4e64-9a6f-c832982ab133/badge)](https://nodesecurity.io/orgs/ivan-gabriele/projects/9a5931e7-b38c-4e64-9a6f-c832982ab133)

## Example

Electra Project is using this tool to handle all their translations: [https://translations.electraproject.org](https://translations.electraproject.org).

## Deploy

Translectra is quite easy to deploy and just require environment variables to be set in order to work (no need to touch the code at all id you use modern CI environments like Heroku).

### Heroku

1. Create your heroku app in the dashboard or via the Heroku Toolbelt.<br>
2. Add a MongoDB add-on, **mLab MongoDB** for example.<br>
3. Set up the required Config Variables:
    - **MONGODB_URL**: your MongoDB URL.<br>
      _It will be added automatically if you use mLab MongoDB._
    - **SESSION_SECRET**: a randomly generated, long and complex passphrase.
    - **WEBSITE_NAME**: your translation website name.
    - **WEBSITE_URL**: your translation website URL.<br>
4. Clone the project locally:<br>
   `git clone https://github.com/Electra-project/translectra.git`<br>
5. Enter the directory:<br>
   `cd translectra`<br>
6. Link your Heroku app:<br>
  `heroku git:remote -a translectra` _(Replace "translectra" by the name of your Heroku app)_<br>
7. Push the project to Heroku:<br>
   `git push heroku master`

That's it ! It should automatically build and deploy now ;)

## Contribute

### Getting Started

    git clone https://github.com/Electra-project/translectra.git
    cd translectra
    npm i

### Start developing

Once you're all set up, you can start coding:

    npm run start:dev

will automatically start a "live" watch compiling the backend & frontend JS code (in `build` folder) on file changes.
