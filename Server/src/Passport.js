import Router from 'koa-router';
import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy } from 'passport-instagram';

import Config, { auth } from './../../config';

class Passport {
  constructor(dbManager) {
    this.db = dbManager;
    this.router = new Router();
    this.router.get('/type', async (ctx) => {
      ctx.status = 200;
      ctx.body = Object.keys(auth).filter(type => auth[type].enable);
    });

    passport.serializeUser((data, done) => {
      done(null, data.userId);
    });

    passport.deserializeUser((userId, done) => {
      done(null, { userId });
    });

    this.options = {
      failureRedirect: '/login',
      authRedirect: '/check',
      updateRedirect: '/setting',
    };

    this.authRouter = ctx => async (err, user, info) => {
      switch (info) {
        case 'auth':
          if (user) {
            await ctx.login(user);
            ctx.redirect(this.options.authRedirect);
          } else {
            ctx.redirect(this.options.failureRedirect);
          }
          break;
        case 'update':
          ctx.redirect(this.options.updateRedirect);
          break;
        default:
          ctx.redirect(this.options.failureRedirect);
      }
    };

    this.userCheck = (request, data, done) => {
      if (request.user) {
        this.db.updateUser(request.user.userId, data)
          .then(user => done(null, user, 'update'))
          .catch(err => done(err.message));
      } else {
        this.db.getUser(data)
          .then(user => done(null, user, 'auth'))
          .catch(err => done(err.message));
      }
    };

    this.local();
    if (auth.twitter.enable) this.twitter();
    if (auth.facebook.enable) this.facebook();
    if (auth.instagram.enable) this.instagram();
  }

  local() {
    passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
    }, (username, password, done) => this.db.findOrCreateUser(username, password)
      .then(user => done(null, user)).catch(err => done(err.message))));
    this.router.post('/local', async (ctx, next) => {
      const authenticate = passport.authenticate('local', async (err, user) => {
        if (user) {
          await ctx.login(user);
          ctx.status = 200;
          ctx.body = 'OK';
        } else {
          ctx.status = 401;
          ctx.body = 'User Not Found';
        }
      });
      await authenticate(ctx, next);
    });
  }

  twitter() {
    passport.use(
      new TwitterStrategy({
        consumerKey: auth.twitter.consumerKey,
        consumerSecret: auth.twitter.consumerSecret,
        callbackURL: `${Config.baseURL}/api/auth/twitter/callback`,
        passReqToCallback: true,
      }, (request, accessToken, tokenSecret, profile, done) =>
        this.userCheck(request, { twitterId: profile.id }, done)));
    this.router.get('/twitter', passport.authorize('twitter'));
    this.router.get('/twitter/callback', async (ctx, next) => {
      await passport.authorize('twitter', this.authRouter(ctx))(ctx, next);
    });
  }

  facebook() {
    passport.use(new FacebookStrategy({
      clientID: auth.facebook.appID,
      clientSecret: auth.facebook.appSecret,
      callbackURL: `${Config.baseURL}/api/auth/facebook/callback`,
      passReqToCallback: true,
    }, (request, accessToken, refreshToken, profile, done) =>
      this.userCheck(request, { facebookId: profile.id }, done)));
    this.router.get('/facebook', passport.authorize('facebook'));
    this.router.get('/facebook/callback', async (ctx, next) => {
      await passport.authorize('facebook', this.authRouter(ctx))(ctx, next);
    });
  }

  instagram() {
    passport.use(new InstagramStrategy({
      clientID: auth.instagram.clientID,
      clientSecret: auth.instagram.clientSecret,
      callbackURL: `${Config.baseURL}/api/auth/instagram/callback`,
      passReqToCallback: true,
    }, (request, accessToken, refreshToken, profile, done) =>
      this.userCheck(request, { instagramId: profile.id }, done)));
    this.router.get('/instagram', passport.authorize('instagram'));
    this.router.get('/instagram/callback', async (ctx, next) => {
      await passport.authorize('instagram', this.authRouter(ctx))(ctx, next);
    });
  }
}

export default Passport;
