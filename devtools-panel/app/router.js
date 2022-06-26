import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('service', {path:'/:service_id'}, function(){
    this.route('page', {path:'/:pageType_id'}, function(){
        this.route('content', {path:'/content'});
    });
  });
  this.route('pageNotFound', { path: '/*wildcard' });
  //this.route('convert');
});

export default Router;
