import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";
import * as config from "config";
import {User} from "../models/user";

export const configureJwt = (passport) => {
    let opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: config.get("app.secret")
    };

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        //console.log(jwt_payload);
        User.findById(jwt_payload._doc._id, (err, user) => {
            if (err) return done(err, false);
            if (user)
                return done(null, user);
            else
                return done(null, false);
        });
    }));
};
