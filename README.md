# reckoning

Prototypes, sandboxes, etc for the Dead Reckoning project.

## Setup for Development

Uses [grunt](http://gruntjs.com) to compile images, less, javascript, etc from /src to /webroot-dev. Please only make changes in /src and use the build process to update webroot-dev. Changes to that directory *should* be committed to the repo however because deployment can just be a matter of `git pull` on the server.

At some point we'll want a "production" build too ("webroot-prod" or something) with more optimizations and compression turned on.

To get set up, you'll need [node](https://nodejs.org) and [npm](https://www.npmjs.com). Also [bower](http://bower.io). Then cd to the repo directory and do something like:

```
#> npm install
#> bower install
#> grunt && grunt watch
```

If everything goes smoothly, this will build the site into webroot-dev and also run a process that will watch for changes in various files and auto-rebuild when those files change.

## Credentials

Some credentials for API services are are not checked in. The code will expect to find a credentials folder which is .gitignored. I'll email you the info for this.