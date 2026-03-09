const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'rpg-Projeto-Hunter',

  remotes: [
    {
      name: 'mfe1',
      entry: 'http://localhost:3000/remoteEntry.js',
      type: 'esm'
    },
    {
      name: 'reactRemote',
      entry: 'http://localhost:5173/remoteEntry.js',
      type: 'esm'
    }
  ],

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto'
    }),
  },

  skip: [
    '@module-federation/enhanced',
    '@module-federation/runtime',
    '@module-federation/sdk',
    '@oxc-parser'
  ]

});
