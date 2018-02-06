import Router from 'koa-router';
import passport from 'koa-passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';

import Config, { auth } from './../../config';

class Passport {
  constructor() {
    this.router = new Router();
    this.router.get('/type', async (ctx) => {
      ctx.status = 200;
      ctx.body = Object.keys(auth).filter(type => auth[type].enable);
    });

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      done(null, {
        id,
      });
    });

    if (auth.twitter.enable) this.twitter();
  }

  twitter() {
    passport.use(new TwitterStrategy({
      consumerKey: auth.twitter.consumerKey,
      consumerSecret: auth.twitter.consumerSecret,
      callbackURL: `${Config.baseURL}/api/auth/twitter/callback`,
    }, (token, tokenSecret, { id }, done) => {
      done(null, { id });
    }));
    this.router.get('/twitter', passport.authenticate('twitter'));
    this.router.get('/twitter/callback', passport.authenticate('twitter', {
      failureRedirect: '/',
      successRedirect: '/view',
    }));
  }
}

export default Passport;
