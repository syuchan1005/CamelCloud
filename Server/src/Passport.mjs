import Router from 'koa-router';
import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy} from 'passport-instagram';

import Config, { auth } from './../../config';

class Passport {
  constructor() {
    this.router = new Router();
    this.router.get('/type', async (ctx) => {
      ctx.status = 200;
      ctx.body = Object.keys(auth).filter(type => auth[type].enable);
    });

    passport.serializeUser(({ id }, done) => {
      done(null, id);
    });

    passport.deserializeUser(async (id, done) => {
      done(null, { id });
    });

    this.options = {
      failureRedirect: '/login',
      successRedirect: '/check',
    };

    if (auth.local.enable) this.local();
    if (auth.twitter.enable) this.twitter();
    if (auth.facebook.enable) this.facebook();
    if (auth.instagram.enable) this.instagram();
  }

  local() {
    passport.use(new LocalStrategy({
      usernameField: 'id',
      passwordField: 'password',
    }, (id, password, done) => {
      done(null, { id });
    }));
    this.router.post('/local', passport.authenticate('local', this.options));
  }

  twitter() {
    passport.use(new TwitterStrategy({
      consumerKey: auth.twitter.consumerKey,
      consumerSecret: auth.twitter.consumerSecret,
      callbackURL: `${Config.baseURL}/api/auth/twitter/callback`,
    }, (accessToken, tokenSecret, { id }, done) => {
      done(null, { id });
    }));
    this.router.get('/twitter', passport.authenticate('twitter'));
    this.router.get('/twitter/callback', passport.authenticate('twitter', this.options));
  }

  facebook() {
    passport.use(new FacebookStrategy({
      clientID: auth.facebook.appID,
      clientSecret: auth.facebook.appSecret,
      callbackURL: `${Config.baseURL}/api/auth/facebook/callback`,
    }, (accessToken, refreshToken, { id }, done) => {
      done(null, { id });
    }));
    this.router.get('/facebook', passport.authenticate('facebook'));
    this.router.get('/facebook/callback', passport.authenticate('facebook', this.options));
  }

  instagram() {
    passport.use(new InstagramStrategy({
      clientID: auth.instagram.clientID,
      clientSecret: auth.instagram.clientSecret,
      callbackURL: `${Config.baseURL}/api/auth/instagram/callback`,
    }, (accessToken, refreshToken, { id }, done) => {
      done(null, { id });
    }));
    this.router.get('/instagram', passport.authenticate('instagram'));
    this.router.get('/instagram/callback', passport.authenticate('instagram', this.options));
  }
}

export default Passport;
