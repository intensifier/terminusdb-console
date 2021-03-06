#!/bin/bash
echo "\
registry=https://api.bintray.com/npm/terminusdb/npm-rc
_auth=$BINTRAY_TOKEN
always-auth=true
email=robin@datachemist.com" > $TRAVIS_BUILD_DIR/.npmrc
curl -XDELETE -u"rrooij:$BINTRAY_CURL_API_KEY" "https://api.bintray.com/packages/terminusdb/npm-rc/terminusdb:terminusdb-console"
npm publish
curl -T "console/dist/terminusdb-console-main.css" -u"rrooij:$BINTRAY_CURL_API_KEY" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-console/rc/rc/terminusdb-console-main.css?publish=1&override=1"
curl -T "console/dist/terminusdb-console.min.js" -u"rrooij:$BINTRAY_CURL_API_KEY" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-console/rc/rc/terminusdb-console.min.js?publish=1&override=1"
