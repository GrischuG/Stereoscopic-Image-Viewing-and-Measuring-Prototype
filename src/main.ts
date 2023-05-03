import { AureliaConfiguration } from 'aurelia-configuration';
import { Aurelia, LogManager } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

const authConfig = {
    signupUrl: 'user',
    loginOnSignup : true,
    signupRedirect : '/',
    loginUrl: 'login',
    loginRedirect: '/',
    logoutRedirect: '/',
    expiredReload : 1,
    tokenName: 'token'
};

export function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .feature(PLATFORM.moduleName('resources/index'))
        .plugin(PLATFORM.moduleName('aurelia-configuration'), (config) => {
            const env = process.env.AU_ENV || 'develop';
            console.log(env);
            config.setDirectory('./config/');
            config.setConfig('environment.json');
            config.setEnvironment(env);

        })
        .plugin(PLATFORM.moduleName('aurelia-dialog'))
        .plugin(PLATFORM.moduleName('aurelia-google-maps'), config => {
          config.options({
              apiKey: 'AIzaSyBIICGejnJ0wX7dmvPiR1jtEwHQwdrV6vU', // use `false` to disable the key
              apiLibraries: 'drawing,geometry', //get optional libraries like drawing, geometry, ... - comma seperated list
              options: { panControl: true, panControlOptions: { position: 9 } }, //add google.maps.MapOptions on construct (https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions)
              language: "" , // default: uses browser configuration (recommended). Set this parameter to set another language (https://developers.google.com/maps/documentation/javascript/localization)
              region: "", // default: it applies a default bias for application behavior towards the United States. (https://developers.google.com/maps/documentation/javascript/localization)
              markerCluster: {
                  enable: false,
                  src: 'https://cdn.rawgit.com/googlemaps/v3-utility-library/99a385c1/markerclusterer/src/markerclusterer.js', // self-hosting this file is highly recommended. (https://developers.google.com/maps/documentation/javascript/marker-clustering)
                  imagePath: 'https://cdn.rawgit.com/googlemaps/v3-utility-library/tree/master/markerclusterer/images/m', // the base URL where the images representing the clusters will be found. The full URL will be: `{imagePath}{[1-5]}`.`{imageExtension}` e.g. `foo/1.png`. Self-hosting these images is highly recommended. (https://developers.google.com/maps/documentation/javascript/marker-clustering)
                  imageExtension: 'png',
              }
          });
      });
       

    aurelia.start().then(() => {
        const config = aurelia.container.get(AureliaConfiguration);
        if (!config.get('debug')) {
            LogManager.setLevel(LogManager.logLevel.debug);
        }
        aurelia.setRoot(PLATFORM.moduleName('app'));
    });
}
