define([
    'streamhub-sdk/collection/clients/http-client',
    'inherits'],
function(LivefyreHttpClient, inherits) {
    'use strict';

    /**
     * A Client for requesting content from a given author
     * @exports streamhub-sdk/collection/clients/bootstrap-client
     */
    var AuthorContentClient = function (opts) {
        opts = opts || {};
        opts.serviceName = 'bootstrap';
        LivefyreHttpClient.call(this, opts);
    };

    inherits(AuthorContentClient, LivefyreHttpClient);

    AuthorContentClient.prototype._serviceName = 'bootstrap';

    AuthorContentClient.prototype.getAuthorContent = function (opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            this._getUrlBase(opts),
            "/api/v3.1",
            "/author/",
            opts.authorId,
            "/content/"
        ].join("");

        var params = {
            limit: opts.limit,
            until: opts.until
        };

        this._request({
            data: params,
            url: url
        }, callback);
    };

    AuthorContentClient.prototype.getAuthorStats = function (opts, callback) {
        opts = opts || {};
        callback = callback || function() {};
        var url = [
            this._getUrlBase(opts),
            "/api/v3.1",
            "/author/",
            opts.authorId,
            "/stats/"
        ].join("");

        this._request({
            url: url
        }, callback);
    };

    return AuthorContentClient;
});
