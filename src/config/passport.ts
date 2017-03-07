/*
import {Strategy as JwtStrategy, ExtractJwt} from "passport-jwt";
import {dbconfig} from "./database";
import {userSchema} from "../schemas/user";

module.exports = function(passport) {
    let opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: dbconfig.secret
    };

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        //console.log(jwt_payload);
        userSchema.findById(jwt_payload._doc._id, (err, user) => {
            if (err) return done(err, false);
            if (user)
                return done(null, user);
            else
                return done(null, false);
        });
    }));
};*/
