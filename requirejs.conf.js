require.config({
  paths: {
    json: 'lib/requirejs-plugins/src/json',
    jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    'jasmine-jquery': 'lib/jasmine-jquery/lib/jasmine-jquery',
    inherits: 'lib/inherits/inherits'
  },
  packages: [{
    name: "streamhub-sdk",
    location: "src"
  },{
    name: "streamhub-sdk/auth",
    location: "src/auth"
  },{
    name: "streamhub-sdk/collection",
    location: "src/collection"
  },{
    name: "streamhub-sdk/content",
    location: "src/content"
  },{
    name: "streamhub-sdk/modal",
    location: "src/modal"
  },{
    name: "streamhub-sdk/jquery",
    location: "src",
    main: "jquery"
  },{
    name: "streamhub-sdk-tests",
    location: "tests"
  },{
    name: "stream",
    location: "lib/stream/src"
  }],
  shim: {
    jasmine: {
        exports: 'jasmine'
    },
    'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine'
    }
  }
});
