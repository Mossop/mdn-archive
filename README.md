# mdn-archive

A basic webserver serving content from the [MDN Archive](https://github.com/mdn/archived-content/).

To use clone (or otherwise download) the [archive](https://github.com/mdn/archived-content/) to `archived-content`
then `yarn build && yarn start`.

The content of the archive is in pretty bad shape, there are bad links everywhere. This webserver attempts to
do some fuzzy matching of requested pages to find matches more of the time. This could be improved in the future.

There is currently no styling or indexing of any kind.
